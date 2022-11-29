import { ICreativeService } from './../../../../services/CreativeService';
import { IPluginService } from './../../../../services/PluginService';
import { CreativeSubtype } from './../../../../models/creative/CreativeResource';
import { DisplayCreativeFormData, isDisplayAdResource, DisplayAdShape } from './domain';
import { DisplayAdCreateRequest } from '../../../../models/creative/CreativeResource';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';
import {
  PropertyResourceShape,
  AssetPropertyCreationResource,
} from '../../../../models/plugin/index';
import { UploadFile } from 'antd/lib/upload/interface';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../../constants/types';
import { extractData, extractDataList } from '../../../../utils/ApiHelper';

type TCreativeId = string;

function normalizeProperties(properties: PropertyResourceShape[]) {
  return normalizeArrayOfObject(
    properties.sort(a => {
      return a.writable === false ? -1 : 1;
    }),
    'technical_name',
  );
}

export interface IDisplayCreativeFormService {
  initializeFormData: (
    adRendererId: string,
    subtype: CreativeSubtype,
    defaultFormat?: string,
  ) => Promise<DisplayCreativeFormData>;
  loadFormData: (creativeId: string) => Promise<DisplayCreativeFormData>;
  saveDisplayCreative: (
    organisationId: string,
    formData: DisplayCreativeFormData,
  ) => Promise<TCreativeId>;
  handleSaveMutipleCreatives: (
    organisationId: string,
    formData: DisplayCreativeFormData,
  ) => Promise<any>;
}

@injectable()
export class DisplayCreativeFormService implements IDisplayCreativeFormService {
  @inject(TYPES.IPluginService)
  private _pluginService: IPluginService;

  @inject(TYPES.ICreativeService)
  private _creativeService: ICreativeService;

  initializeFormData(
    adRendererId: string,
    subtype: CreativeSubtype,
    defaultFormat?: string,
  ): Promise<DisplayCreativeFormData> {
    return this._pluginService.getPlugin(adRendererId).then(plugin => {
      return this._pluginService
        .getPluginVersion(adRendererId, plugin.data.current_version_id!)
        .then(resp => {
          const lastVersion = resp.data;

          return Promise.all([
            this._pluginService.getPluginVersionProperties(adRendererId, lastVersion.id),
            this._pluginService.getLocalizedPluginLayout(adRendererId, lastVersion.id),
          ]).then(res => {
            const properties = res[0].data;
            const pLayoutRes = res[1];
            const pLayout = pLayoutRes !== null ? pLayoutRes : undefined;

            const creative: Partial<DisplayAdShape> = {
              subtype,
            };
            if (defaultFormat) {
              creative.format = defaultFormat;
            }
            return {
              creative,
              rendererPlugin: lastVersion,
              properties: normalizeProperties(properties),
              pluginLayout: pLayout,
              repeatFields: [],
            };
          });
        });
    });
  }

  loadFormData(creativeId: string): Promise<DisplayCreativeFormData> {
    return Promise.all([
      this._creativeService.getDisplayAd(creativeId).then(extractData),
      this._creativeService.getCreativeRendererProperties(creativeId).then(extractDataList),
    ]).then(([creative, rendererProperties]) => {
      return Promise.all([
        this._pluginService
          .getPluginVersion(creative.renderer_plugin_id, creative.renderer_version_id)
          .then(extractData),
        this._pluginService.getLocalizedPluginLayout(
          creative.renderer_plugin_id,
          creative.renderer_version_id,
        ),
      ]).then(res => {
        const plugin = res[0];
        const pLayoutRes = res[1];
        const pLayout = pLayoutRes !== null ? pLayoutRes : undefined;
        const formData: DisplayCreativeFormData = {
          creative,
          rendererPlugin: plugin,
          properties: normalizeProperties(rendererProperties),
          pluginLayout: pLayout,
          repeatFields: [],
        };
        return formData;
      });
    });
  }

  saveDisplayCreative(
    organisationId: string,
    formData: DisplayCreativeFormData,
  ): Promise<TCreativeId> {
    const { creative, rendererPlugin, properties } = formData;

    let createOrUpdatePromise;
    if (isDisplayAdResource(creative)) {
      createOrUpdatePromise = this._creativeService.updateDisplayCreative(creative.id, creative);
    } else {
      const resource: Partial<DisplayAdCreateRequest> = {
        renderer_artifact_id: rendererPlugin.artifact_id,
        renderer_group_id: rendererPlugin.group_id,
        editor_artifact_id: 'default-editor',
        editor_group_id: 'com.mediarithmics.creative.display',
        subtype: formData.creative.subtype,
        ...creative,
      };
      createOrUpdatePromise = this._creativeService.createDisplayCreative(organisationId, resource);
    }

    return createOrUpdatePromise.then(resp => {
      const creativeId = resp.data.id;

      return Promise.all(
        Object.keys(properties)
          .filter(key => properties[key].writable)
          .map(key => {
            const item = properties[key];
            return this._creativeService.updateDisplayCreativeRendererProperty(
              organisationId,
              creativeId,
              item.technical_name,
              item,
            );
          }),
      ).then(() => {
        return this._creativeService.takeScreenshot(creativeId).then(() => {
          return creativeId;
        });
      });
    });
  }

  handleSaveMutipleCreatives(
    organisationId: string,
    formData: DisplayCreativeFormData,
  ): Promise<any> {
    const { rendererPlugin, repeatFields } = formData;

    const getImageFormat = (file: UploadFile) => {
      return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.addEventListener('load', (i: any) => {
          resolve(`${img.width}x${img.height}`);
        });
        img.src = url;
      });
    };

    return Promise.all(
      (repeatFields || []).map(field => {
        const imageProperty: AssetPropertyCreationResource = {
          technical_name: 'image',
          value: {
            file: field.file,
          },
          property_type: 'ASSET',
          origin: 'PLUGIN',
          writable: true,
          deletable: false,
        };

        const properties = {
          ...formData.properties,
          image: imageProperty,
        };

        return getImageFormat(field.file).then(i => {
          const creative: DisplayAdShape = {
            ...formData.creative,
            destination_domain: formData.creative.destination_domain,
            name: field.name,
            format: i as string,
          };

          const newFormData: DisplayCreativeFormData = {
            creative,
            rendererPlugin,
            properties,
            repeatFields,
          };

          return this.saveDisplayCreative(organisationId, newFormData);
        });
      }),
    );
  }
}

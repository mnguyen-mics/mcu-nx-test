import { CreativeSubtype } from './../../../../models/creative/CreativeResource';
import { DisplayCreativeFormData, isDisplayAdResource, DisplayAdShape } from './domain';
import CreativeService from '../../../../services/CreativeService';
import { extractData, extractDataList } from '../../../../services/ApiService';
import PluginService from '../../../../services/PluginService';
import { DisplayAdCreateRequest } from '../../../../models/creative/CreativeResource';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';
import { PropertyResourceShape } from '../../../../models/plugin/index';
import { UploadFile } from 'antd/lib/upload/interface';

type TCreativeId = string;

function normalizeProperties(properties: PropertyResourceShape[]) {
  return normalizeArrayOfObject(
    properties.sort(a => {
      return a.writable === false ? -1 : 1;
    }),
    'technical_name',
  );
}

const DisplayCreativeFormService = {
  initializeFormData(adRendererId: string, subtype: CreativeSubtype): Promise<DisplayCreativeFormData> {
    return PluginService.getPluginVersions(adRendererId).then(resp => {
      const lastVersion = resp.data[resp.data.length - 1];

      return Promise.all([
        PluginService.getPluginVersionProperty(
          adRendererId,
          lastVersion.id,
        ),
        PluginService.getLocalizedPluginLayout(
          adRendererId,
          lastVersion.id
        )
      ]).then(res => {
        const properties = res[0].data;
        const pLayoutRes = res[1];
        const pLayout = (pLayoutRes !== null && pLayoutRes.status !== "error") ?
          pLayoutRes.data
          :
          undefined;
        return {
          creative: {
            subtype: subtype
          },
          rendererPlugin: lastVersion,
          properties: normalizeProperties(properties),
          pluginLayout: pLayout,
          repeatFields: []
        };
      });
    });
  },

  loadFormData(creativeId: string): Promise<DisplayCreativeFormData> {
    return Promise.all([
      CreativeService.getDisplayAd(creativeId).then(extractData),
      CreativeService.getCreativeRendererProperties(creativeId).then(
        extractDataList,
      ),
    ]).then(([creative, rendererProperties]) => {

      return Promise.all([
        PluginService.getPluginVersion(
          creative.renderer_plugin_id,
          creative.renderer_version_id,
        ).then(extractData),
        PluginService.getLocalizedPluginLayout(
          creative.renderer_plugin_id,
          creative.renderer_version_id
        )
      ]).then(res => {
        const plugin = res[0];
        const pLayoutRes = res[1];
        const pLayout = (pLayoutRes !== null && pLayoutRes.status !== "error") ?
          pLayoutRes.data
          :
          undefined;
        const formData: DisplayCreativeFormData = {
          creative,
          rendererPlugin: plugin,
          properties: normalizeProperties(rendererProperties),
          pluginLayout: pLayout,
          repeatFields: []
        }
        return formData;
      });
    });
  },

  saveDisplayCreative(
    organisationId: string,
    formData: DisplayCreativeFormData,
  ): Promise<TCreativeId> {
    const { creative, rendererPlugin, properties } = formData;

    let createOrUpdatePromise;
    if (isDisplayAdResource(creative)) {
      createOrUpdatePromise = CreativeService.updateDisplayCreative(
        creative.id,
        creative,
      );
    } else {
      const resource: Partial<DisplayAdCreateRequest> = {
        renderer_artifact_id: rendererPlugin.artifact_id,
        renderer_group_id: rendererPlugin.group_id,
        editor_artifact_id: 'default-editor',
        editor_group_id: 'com.mediarithmics.creative.display',
        subtype: formData.creative.subtype,
        ...creative
      };
      createOrUpdatePromise = CreativeService.createDisplayCreative(
        organisationId,
        resource,
      );
    }

    return createOrUpdatePromise.then(resp => {
      const creativeId = resp.data.id;

      return Promise.all(
        Object.keys(properties)
          .filter(key => properties[key].writable)
          .map(key => {
            const item = properties[key];
            return CreativeService.updateDisplayCreativeRendererProperty(
              organisationId,
              creativeId,
              item.technical_name,
              item,
            );
          }),
      ).then(() => {
        return CreativeService.takeScreenshot(creativeId).then(() => {
          return creativeId;
        });
      });
    });
  },

  handleSaveMutipleCreatives(
    organisationId: string,
    formData: DisplayCreativeFormData,
  ): Promise<any> {

    const { rendererPlugin, repeatFields } = formData;

    const getImageFormat = (file: UploadFile) => {
      return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.addEventListener("load", (i: any) => {
          resolve(`${img.width}x${img.height}`)
        });
        img.src = url;
      })
    }

    return Promise.all((repeatFields || []).map(field => {

      const properties: any = {
        ...formData.properties,
        image: {
          technical_name: 'image',
          value: {
            file: field.file
          },
          property_type: 'ASSET',
          origin: 'PLUGIN',
          writable: true,
          deletable: false
        }
      }
    
      return getImageFormat(field.file).then((i) => {
        const creative: DisplayAdShape = {
          destination_domain: formData.creative.destination_domain,
          name: field.name,
          format: i as string
        }

        const newFormData: DisplayCreativeFormData = {
          creative,
          rendererPlugin,
          properties,
          repeatFields
        }

        return DisplayCreativeFormService.saveDisplayCreative(
          organisationId,
          newFormData
        )
      })
    }))
  }
};

export default DisplayCreativeFormService;

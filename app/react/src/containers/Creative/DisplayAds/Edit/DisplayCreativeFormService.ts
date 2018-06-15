import { CreativeSubtype } from './../../../../models/creative/CreativeResource';
import { DisplayCreativeFormData, isDisplayAdResource } from './domain';
import CreativeService from '../../../../services/CreativeService';
import { extractData, extractDataList } from '../../../../services/ApiService';
import PluginService from '../../../../services/PluginService';
import { DisplayAdCreateRequest } from '../../../../models/creative/CreativeResource';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';
import { PropertyResourceShape } from '../../../../models/plugin/index';

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
      return PluginService.getPluginVersionProperty(
        adRendererId,
        lastVersion.id,
      ).then(properties => {
        return {
          creative: {
            subtype: subtype
          },
          rendererPlugin: lastVersion,
          properties: normalizeProperties(properties),
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
      return PluginService.getPluginVersion(
        creative.renderer_plugin_id,
        creative.renderer_version_id,
      )
        .then(extractData)
        .then(plugin => {
          return {
            creative,
            rendererPlugin: plugin,
            properties: normalizeProperties(rendererProperties),
          };
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
};

export default DisplayCreativeFormService;

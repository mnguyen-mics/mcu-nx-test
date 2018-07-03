import { DataResponse } from './../../../../../services/ApiService';
import {
  PluginProperty,
  AttributionModel,
} from './../../../../../models/Plugins';
import { AttributionModelFormData, isExistingAttributionModel } from './domain';
import AttributionModelService from '../../../../../services/AttributionModelService';

const AttributionModelFormService = {
  saveOrCreatePluginInstance(
    organisationId: string,
    formData: AttributionModelFormData,
  ): Promise<DataResponse<AttributionModel>> {
    // if edition update
    let createOrUpdatePromise;
    if (isExistingAttributionModel(formData.plugin)) {
      const plugin = formData.plugin;
      createOrUpdatePromise = Promise.all([
        AttributionModelService.updateAttributionModel(plugin.id, plugin),
        AttributionModelFormService.updatePropertiesValue(
          organisationId,
          plugin.id,
          formData.properties,
        ),
      ]).then(res => res[0]);
    } else {
      const plugin = formData.plugin;
      createOrUpdatePromise = AttributionModelService.createAttributionModel(
        organisationId,
        plugin,
      ).then(newAttribModelres => {
        return AttributionModelFormService.updatePropertiesValue(
          organisationId,
          newAttribModelres.data.id,
          formData.properties,
        ).then(() => newAttribModelres);
      });
    }
    return createOrUpdatePromise.then(res => res);
  },

  updatePropertiesValue(
    organisationId: string,
    attributionModelId: string,
    properties: PluginProperty[],
  ) {
    return Promise.all(
      properties.map(p =>
        AttributionModelService.updateAttributionModelProperty(
          organisationId,
          attributionModelId,
          p.technical_name,
          p,
        ),
      ),
    );
  },
};

export default AttributionModelFormService;

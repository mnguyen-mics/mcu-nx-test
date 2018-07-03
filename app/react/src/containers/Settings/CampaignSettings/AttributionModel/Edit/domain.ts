import { AttributionModelCreateRequest } from './../../../../../models/Plugins';
import { AttributionModel, PluginProperty } from '../../../../../models/Plugins';

export interface AttributionModelFormData {
  plugin: AttributionModel | Partial<AttributionModelCreateRequest>;
  properties: PluginProperty[];
}

export function isExistingAttributionModel(
  plugin: AttributionModel | Partial<AttributionModelCreateRequest>,
): plugin is AttributionModel {
  return (plugin as AttributionModel).id !== undefined;
}

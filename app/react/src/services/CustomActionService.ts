import { PropertyResourceShape } from './../models/plugin/index';
import {
  DataListResponse,
  DataResponse,
} from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { PluginLayout } from './../models/plugin/PluginLayout';
import { injectable } from 'inversify';
import PluginInstanceService from './PluginInstanceService';
import { CustomActionResource } from '../models/Plugins';

export interface ICustomActionService {
  getInstances: (options?: object) => Promise<DataListResponse<CustomActionResource>>;
  getInstanceById: (id: string, options?: object) => Promise<DataResponse<CustomActionResource>>;
  getInstanceProperties: (
    id: string,
    options?: object,
  ) => Promise<DataListResponse<PropertyResourceShape>>;
  updatePluginInstance: (
    id: string,
    options: object,
  ) => Promise<DataResponse<CustomActionResource>>;
  updatePluginInstanceProperty: (
    organisationId: string,
    id: string,
    technicalName: string,
    params: object,
  ) => Promise<DataResponse<PropertyResourceShape> | void>;
  createPluginInstance: (
    organisationId: string,
    options: object,
  ) => Promise<DataResponse<CustomActionResource>>;
  getLocalizedPluginLayout(pInstanceId: string): Promise<PluginLayout | null>;
}

@injectable()
export class CustomActionService
  extends PluginInstanceService<CustomActionResource>
  implements ICustomActionService
{
  constructor() {
    super('scenario_custom_actions');
  }

  getLocalizedPluginLayout(pInstanceId: string): Promise<PluginLayout | null> {
    return this.getInstanceById(pInstanceId).then(res => {
      const customAction = res.data;
      return this._pluginService
        .findPluginFromVersionId(customAction.version_id)
        .then(pluginResourceRes => {
          const pluginResource = pluginResourceRes.data;
          return this._pluginService.getLocalizedPluginLayout(
            pluginResource.id,
            customAction.version_id,
          );
        });
    });
  }
}

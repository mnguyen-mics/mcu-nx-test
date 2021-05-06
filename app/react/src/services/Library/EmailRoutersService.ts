import ApiService, { DataResponse, DataListResponse } from '../ApiService';
import { EmailRouter } from '../../models/Plugins';
import PluginInstanceService from '../PluginInstanceService';
import { PluginLayout } from '../../models/plugin/PluginLayout';
import { injectable } from 'inversify';

export interface IEmailRouterService {
  getEmailRouters: (
    organisationId: string,
    options?: object,
  ) => Promise<DataListResponse<EmailRouter>>;
  getEmailRouter: (id: string, options?: object) => Promise<DataResponse<EmailRouter>>;
  deleteEmailRouter: (id: string, options?: object) => Promise<DataResponse<any>>;
  getLocalizedPluginLayout: (pInstanceId: string) => Promise<PluginLayout | null>;
}

@injectable()
export class EmailRouterService
  extends PluginInstanceService<EmailRouter>
  implements IEmailRouterService {
  constructor() {
    super('email_routers');
  }

  getEmailRouters(
    organisationId: string,
    options: object = {},
  ): Promise<DataListResponse<EmailRouter>> {
    const endpoint = 'email_routers';

    const params = {
      organisation_id: organisationId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  }

  getEmailRouter(id: string, options: object = {}): Promise<DataResponse<EmailRouter>> {
    const endpoint = `email_routers/${id}`;

    const params = {
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  }

  deleteEmailRouter(id: string, options: object = {}): Promise<DataResponse<any>> {
    const endpoint = `email_routers/${id}`;

    const params = {
      ...options,
    };
    return ApiService.deleteRequest(endpoint, params);
  }

  getLocalizedPluginLayout(pInstanceId: string): Promise<PluginLayout | null> {
    return this.getInstanceById(pInstanceId).then(res => {
      const emailRouter = res.data;
      return this._pluginService
        .findPluginFromVersionId(emailRouter.version_id)
        .then(pluginResourceRes => {
          const pluginResource = pluginResourceRes.data;
          return this._pluginService.getLocalizedPluginLayout(
            pluginResource.id,
            emailRouter.version_id,
          );
        });
    });
  }
}

import ApiService, { DataResponse, DataListResponse } from '../ApiService';

import { EmailRouter } from '../../models/Plugins';
import PluginInstanceService from '../PluginInstanceService';
import PluginService from '../PluginService';
import { PluginLayout } from '../../models/plugin/PluginLayout';

class EmailRouterService extends PluginInstanceService<EmailRouter> {
  constructor() {
    super('email_routers');
  };

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
  };

  deleteEmailRouter(
    id: string,
    options: object = {},
  ): Promise<DataResponse<any>> {
    const endpoint = `email_routers/${id}`;

    const params = {
      ...options,
    };
    return ApiService.deleteRequest(endpoint, params);
  };

  getLocalizedPluginLayout(pInstanceId: string): Promise<PluginLayout | null> {
    return this.getInstanceById(pInstanceId).then(res => {
      const emailRouter = res.data;
      return PluginService.findPluginFromVersionId(emailRouter.version_id).then(pluginResourceRes => {
        const pluginResource = pluginResourceRes.data;
        return PluginService.getLocalizedPluginLayout(
          pluginResource.id,
          emailRouter.version_id
        );
      });
    });
  }

}

export default new EmailRouterService();

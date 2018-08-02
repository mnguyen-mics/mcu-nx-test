import ApiService, { DataResponse, DataListResponse } from '../ApiService';

import { EmailRouter } from '../../models/Plugins';
import PluginInstanceService from '../PluginInstanceService';

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

}

export default new EmailRouterService();

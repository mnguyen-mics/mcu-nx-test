import ApiService, { DataResponse, DataListResponse } from '../ApiService';
import PluginService from '../PluginService';
import { EmailRouter, PropertyResourceShape } from '../../models/Plugins';

const emailRouterService = {
  getEmailRouters(organisationId: string, options: object = {}): Promise<DataListResponse<EmailRouter>> {
    const endpoint = 'email_routers';

    const params = {
      organisation_id: organisationId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  },
  getEmailRouterProperty(id: string, options: object = {}): Promise<DataListResponse<PropertyResourceShape>> {
    const endpoint = `email_routers/${id}/properties`;

    return ApiService.getRequest(endpoint, options);
  },
  getEmailRouter(id: string, options: object = {}): Promise<DataResponse<EmailRouter>> {
    const endpoint = `email_routers/${id}`;

    const params = {
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  },
  deleteEmailRouter(id: string, options: object = {}): Promise<DataResponse<any>> {
    const endpoint = `email_routers/${id}`;

    const params = {
      ...options,
    };
    return ApiService.deleteRequest(endpoint, params);
  },
  createEmailRouter(organisationId: string, options: object = {}): Promise<DataResponse<EmailRouter>> {
    const endpoint = `email_routers?organisation_id=${organisationId}`;

    const params = {
      ...options,
    };

    return ApiService.postRequest(endpoint, params);
  },
  updateEmailRouter(id: string, options: object = {}): Promise<DataResponse<EmailRouter>> {
    const endpoint = `email_routers/${id}`;

    const params = {
      ...options,
    };

    return ApiService.putRequest(endpoint, params);
  },
  updateEmailRouterProperty(
    organisationId: string, id: string, technicalName: string, params: object = {}): Promise<DataResponse<PropertyResourceShape> | void> {
    const endpoint = `email_routers/${id}/properties/technical_name=${technicalName}`;
    return PluginService.handleSaveOfProperties(params, organisationId, 'email_routers', id, endpoint);
  },

};

export default emailRouterService;

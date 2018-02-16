import ApiService, { DataListResponse, DataResponse } from './ApiService';
import { MobileApplicationResource } from '../models/settings/settings';

const mobileApplicationService = {
  getMobileApplications(organisationId: string, datamartId: string, options: object = {}): Promise<DataListResponse<MobileApplicationResource>> {
    const endpoint = `datamarts/${datamartId}/mobile_applications`;
  
    const params = {
      organisation_id: organisationId,
      ...options,
    };
  
    return ApiService.getRequest(endpoint, params);
  },
  getMobileApplication(datamartId: string, mobileApplicationsId: string): Promise<DataResponse<MobileApplicationResource>> {
    const endpoint = `datamarts/${datamartId}/mobile_applications/${mobileApplicationsId}`;
    return ApiService.getRequest(endpoint);
  },
  updateMobileApplication(datamartId: string, mobileApplicationsId: string, body: MobileApplicationResource): Promise<DataResponse<MobileApplicationResource>> {
    const endpoint = `datamarts/${datamartId}/mobile_applications/${mobileApplicationsId}`;
    return ApiService.putRequest(endpoint, body);
  },
  createMobileApplication(organisationId: string, datamartId: string, name: string, token: string): Promise<DataResponse<MobileApplicationResource>> {
    const endpoint = `datamarts/${datamartId}/mobile_applications`;
  
    const params = { organisation_id: organisationId };
  
    const body = {
      organisation_id: organisationId,
      name: name,
      token: token,
    };
  
    return ApiService.postRequest(endpoint, body, params);
  }

}


export default mobileApplicationService;

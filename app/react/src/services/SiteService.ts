import ApiService, { DataListResponse, DataResponse } from './ApiService';
import { SiteResource } from '../models/settings/settings';

const siteService = {
  getSites(organisationId: string, datamartId: string, options: object = {}): Promise<DataListResponse<SiteResource>> {
    const endpoint = `datamarts/${datamartId}/sites`;
  
    const params = {
      organisation_id: organisationId,
      ...options,
    };
  
    return ApiService.getRequest(endpoint, params);
  },
  getSite(datamartId: string, siteId: string): Promise<DataResponse<SiteResource>> {
    const endpoint = `datamarts/${datamartId}/sites/${siteId}`;
    return ApiService.getRequest(endpoint);
  },
  updateSite(datamartId: string, siteId: string, body: Partial<SiteResource>): Promise<DataResponse<SiteResource>> {
    const endpoint = `datamarts/${datamartId}/sites/${siteId}`;
    return ApiService.putRequest(endpoint, body);
  },
  createSite(organisationId: string, datamartId: string, body: Partial<SiteResource>): Promise<DataResponse<SiteResource>> {
    const endpoint = `datamarts/${datamartId}/sites`;
  
    const params = { organisation_id: organisationId };
  
    const object = {
      ...body,
      organisation_id: organisationId,
    };
  
    return ApiService.postRequest(endpoint, object, params);
  }
}

export default siteService;

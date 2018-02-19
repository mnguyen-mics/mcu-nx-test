import ApiService, { DataListResponse } from './ApiService';
import { DatamartResource } from '../models/datamart/DatamartResource';


const datamartServices = {
  getDatamarts(organisationId: string, options: object = {}): Promise<DataListResponse<DatamartResource>> {
    const endpoint = 'datamarts';
  
    const params = {
      organisation_id: organisationId,
      ...options,
    };
  
    return ApiService.getRequest(endpoint, params);
  },
  getDatamart(datamartId: string) {
    const endpoint = `datamarts/${datamartId}`;
    return ApiService.getRequest(endpoint);
  }
}

export default datamartServices;

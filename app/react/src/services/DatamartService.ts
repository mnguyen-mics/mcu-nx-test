import ApiService, { DataListResponse, DataResponse } from './ApiService';
import { DatamartResource, UserCompartment } from '../models/datamart/DatamartResource';
import { EventRules } from '../models/settings/settings';


const datamartServices = {
  getDatamarts(organisationId: string, options: object = {}): Promise<DataListResponse<DatamartResource>> {
    const endpoint = 'datamarts';
  
    const params = {
      organisation_id: organisationId,
      ...options,
    };
  
    return ApiService.getRequest(endpoint, params);
  },
  getDatamart(datamartId: string): Promise<DataResponse<DatamartResource>> {
    const endpoint = `datamarts/${datamartId}`;
    return ApiService.getRequest(endpoint);
  },
  updateDatamart(datamartId: string, datamart: Partial<DatamartResource>): Promise<DataResponse<DatamartResource>> {
    const endpoint = `datamarts/${datamartId}`;
    return ApiService.putRequest(endpoint, datamart);
  },
  createDatamart(organisationId: string, datamart: Partial<DatamartResource>): Promise<DataResponse<DatamartResource>> {
    const endpoint = `datamarts?organisation_id=${organisationId}`;
    return ApiService.postRequest(endpoint, datamart);
  },
  getEventRules(datamartId: string, organisationId: string): Promise<DataListResponse<EventRules>> {
    const endpoint = `datamarts/${datamartId}/event_rules`;
    return ApiService.getRequest(endpoint, { organisation_id: organisationId })
  },
  createEventRules(datamartId: string, body: { organisation_id: string, properties: Partial<EventRules>}): Promise<DataResponse<EventRules>> {
    const endpoint = `datamarts/${datamartId}/event_rules`;
    return ApiService.postRequest(endpoint, body)
  },
  updateEventRules(datamartId: string, organisationId: string, eventRuleId: string, body: Partial<EventRules>): Promise<DataResponse<EventRules>> {
    const endpoint = `datamarts/${datamartId}/event_rules/${eventRuleId}`;
    return ApiService.putRequest(endpoint, body)
  },
  deleteEventRules(datamartId: string, organisationId: string, eventRuleId: string): Promise<DataResponse<EventRules>> {
    const endpoint = `datamarts/${datamartId}/event_rules/${eventRuleId}`;
    return ApiService.deleteRequest(endpoint)
  },
  getUserCompartments(datamartId: string): Promise<DataListResponse<UserCompartment>> {
    const endpoint = `datamarts/${datamartId}/user_account_compartments`;
    return ApiService.getRequest(endpoint)
  }
}

export default datamartServices;

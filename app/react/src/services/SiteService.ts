import ApiService, { DataListResponse, DataResponse } from './ApiService';
import { SiteResource, EventRules, Aliases } from '../models/settings/settings';

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
  },
  getEventRules(datamartId: string, siteId: string, organisationId: string): Promise<DataListResponse<EventRules>> {
    const endpoint = `datamarts/${datamartId}/sites/${siteId}/event_rules`;
    return ApiService.getRequest(endpoint, { organisation_id: organisationId })
  },
  createEventRules(datamartId: string, siteId: string, body: { organisation_id: string, properties: Partial<EventRules>}): Promise<DataResponse<EventRules>> {
    const endpoint = `datamarts/${datamartId}/sites/${siteId}/event_rules`;
    return ApiService.postRequest(endpoint, body)
  },
  updateEventRules(datamartId: string, siteId: string, organisationId: string, eventRuleId: string, body: Partial<EventRules>): Promise<DataResponse<EventRules>> {
    const endpoint = `datamarts/${datamartId}/sites/${siteId}/event_rules/${eventRuleId}`;
    return ApiService.putRequest(endpoint, body)
  },
  deleteEventRules(datamartId: string, siteId: string, organisationId: string, eventRuleId: string): Promise<DataResponse<EventRules>> {
    const endpoint = `datamarts/${datamartId}/sites/${siteId}/event_rules/${eventRuleId}`;
    return ApiService.deleteRequest(endpoint)
  },
  getAliases(datamartId: string, siteId: string, organisationId: string): Promise<DataListResponse<Aliases>> {
    const endpoint = `datamarts/${datamartId}/sites/${siteId}/aliases`;
    return ApiService.getRequest(endpoint, { organisation_id: organisationId })
  },
  createAliases(datamartId: string, siteId: string, body: Partial<Aliases>): Promise<DataResponse<Aliases>> {
    const endpoint = `datamarts/${datamartId}/sites/${siteId}/aliases`;
    return ApiService.postRequest(endpoint, body)
  },
  updateAliases(datamartId: string, siteId: string, organisationId: string, eventRuleId: string, body: Partial<Aliases>): Promise<void> {
    // const endpoint = `datamarts/${datamartId}/sites/${siteId}/aliases/${eventRuleId}`;
    // return ApiService.putRequest(endpoint, body)
    // wait until bug is corrected and revert to original
    return Promise.resolve()
  },
  deleteAliases(datamartId: string, siteId: string, organisationId: string, eventRuleId: string): Promise<DataResponse<Aliases>> {
    const endpoint = `datamarts/${datamartId}/sites/${siteId}/aliases/${eventRuleId}`;
    return ApiService.deleteRequest(endpoint)
  }
}

export default siteService;

import ApiService, { DataListResponse, DataResponse } from './ApiService';
import {
  EventRules,
  Aliases,
  ChannelResource,
  ChannelResourceShape,
  SiteResource,
  MobileApplicationResource,
} from '../models/settings/settings';

const channelService = {
  getChannels(
    organisationId: string,
    datamartId: string,
    options: object = {},
  ): Promise<DataListResponse<ChannelResource>> {
    const endpoint = `datamarts/${datamartId}/channels`;

    const params = {
      organisation_id: organisationId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  },
  getChannel(
    datamartId: string,
    channelId: string,
  ): Promise<DataResponse<ChannelResource>> {
    const endpoint = `datamarts/${datamartId}/channels/${channelId}`;
    return ApiService.getRequest(endpoint);
  },
  updateSite(
    datamartId: string,
    siteId: string,
    body: Partial<SiteResource>,
  ): Promise<DataResponse<SiteResource>> {
    const endpoint = `datamarts/${datamartId}/sites/${siteId}`;
    return ApiService.putRequest(endpoint, body);
  },
  updateMobileApplication(
    datamartId: string,
    mobileApplicationsId: string,
    body: Partial<MobileApplicationResource>,
  ): Promise<DataResponse<MobileApplicationResource>> {
    const endpoint = `datamarts/${datamartId}/mobile_applications/${mobileApplicationsId}`;
    return ApiService.putRequest(endpoint, body);
  },
  createChannel(
    organisationId: string,
    datamartId: string,
    body: Partial<ChannelResourceShape>,
  ): Promise<DataResponse<ChannelResource>> {
    const endpoint = `datamarts/${datamartId}/channels`;

    const params = { organisation_id: organisationId };

    const object = {
      ...body,
      organisation_id: organisationId,
    };

    return ApiService.postRequest(endpoint, object, params);
  },
  getEventRules(
    datamartId: string,
    channelId: string,
    organisationId: string,
  ): Promise<DataListResponse<EventRules>> {
    const endpoint = `datamarts/${datamartId}/channels/${channelId}/event_rules`;
    return ApiService.getRequest(endpoint, { organisation_id: organisationId });
  },
  createEventRules(
    datamartId: string,
    channelId: string,
    body: { organisation_id: string; properties: Partial<EventRules> },
  ): Promise<DataResponse<EventRules>> {
    const endpoint = `datamarts/${datamartId}/channels/${channelId}/event_rules`;
    return ApiService.postRequest(endpoint, body);
  },
  updateEventRules(
    datamartId: string,
    channelId: string,
    organisationId: string,
    eventRuleId: string,
    body: Partial<EventRules>,
  ): Promise<DataResponse<EventRules>> {
    const endpoint = `datamarts/${datamartId}/channels/${channelId}/event_rules/${eventRuleId}`;
    return ApiService.putRequest(endpoint, body);
  },
  deleteEventRules(
    datamartId: string,
    channelId: string,
    organisationId: string,
    eventRuleId: string,
  ): Promise<DataResponse<EventRules>> {
    const endpoint = `datamarts/${datamartId}/channels/${channelId}/event_rules/${eventRuleId}`;
    return ApiService.deleteRequest(endpoint);
  },
  getAliases(
    datamartId: string,
    siteId: string,
    organisationId: string,
  ): Promise<DataListResponse<Aliases>> {
    const endpoint = `datamarts/${datamartId}/sites/${siteId}/aliases`;
    return ApiService.getRequest(endpoint, { organisation_id: organisationId });
  },
  createAliases(
    datamartId: string,
    siteId: string,
    body: Partial<Aliases>,
  ): Promise<DataResponse<Aliases>> {
    const endpoint = `datamarts/${datamartId}/sites/${siteId}/aliases`;
    return ApiService.postRequest(endpoint, body);
  },
  updateAliases(
    datamartId: string,
    siteId: string,
    organisationId: string,
    eventRuleId: string,
    body: Partial<Aliases>,
  ): Promise<void> {
    // const endpoint = `datamarts/${datamartId}/sites/${siteId}/aliases/${eventRuleId}`;
    // return ApiService.putRequest(endpoint, body)
    // wait until bug is corrected and revert to original
    return Promise.resolve();
  },
  deleteAliases(
    datamartId: string,
    siteId: string,
    organisationId: string,
    eventRuleId: string,
  ): Promise<DataResponse<Aliases>> {
    const endpoint = `datamarts/${datamartId}/sites/${siteId}/aliases/${eventRuleId}`;
    return ApiService.deleteRequest(endpoint);
  },
};

export default channelService;

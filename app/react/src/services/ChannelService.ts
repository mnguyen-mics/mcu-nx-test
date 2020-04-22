import { ProcessingSelectionResource } from './../models/consent/UserConsentResource';
import ApiService, { DataListResponse, DataResponse } from './ApiService';
import {
  EventRules,
  Aliases,
  ChannelResource,
  ChannelResourceShape,
  SiteResource,
  MobileApplicationResource,
} from '../models/settings/settings';
import { injectable } from 'inversify';

export interface IChannelService {
  getChannels: (
    options?: object,
  ) => Promise<DataListResponse<ChannelResourceShape>>;
  getChannel: (
    datamartId: string,
    channelId: string,
  ) => Promise<DataResponse<ChannelResource>>;
  updateSite: (
    datamartId: string,
    siteId: string,
    body: Partial<SiteResource>,
  ) => Promise<DataResponse<SiteResource>>;
  deleteSite: (
    datamartId: string,
    siteId: string,
  ) => Promise<DataResponse<SiteResource>>;
  updateMobileApplication: (
    datamartId: string,
    mobileApplicationId: string,
    body: Partial<MobileApplicationResource>,
  ) => Promise<DataResponse<MobileApplicationResource>>;
  deleteMobileApplication: (
    datamartId: string,
    mobileApplicationId: string,
  ) => Promise<DataResponse<MobileApplicationResource>>;
  createChannel: (
    organisationId: string,
    datamartId: string,
    body: Partial<ChannelResourceShape>,
  ) => Promise<DataResponse<ChannelResource>>;
  getEventRules: (
    datamartId: string,
    channelId: string,
    organisationId: string,
  ) => Promise<DataListResponse<EventRules>>;
  createEventRules: (
    datamartId: string,
    channelId: string,
    body: Partial<EventRules>,
  ) => Promise<DataResponse<EventRules>>;
  updateEventRules: (
    datamartId: string,
    channelId: string,
    organisationId: string,
    eventRuleId: string,
    body: Partial<EventRules>,
  ) => Promise<DataResponse<EventRules>>;
  deleteEventRules: (
    datamartId: string,
    channelId: string,
    organisationId: string,
    eventRuleId: string,
  ) => Promise<DataResponse<EventRules>>;
  getAliases: (
    datamartId: string,
    siteId: string,
    organisationId: string,
  ) => Promise<DataListResponse<Aliases>>;
  createAliases: (
    datamartId: string,
    siteId: string,
    body: Partial<Aliases>,
  ) => Promise<DataResponse<Aliases>>;
  updateAliases: (
    datamartId: string,
    siteId: string,
    organisationId: string,
    eventRuleId: string,
    body: Partial<Aliases>,
  ) => Promise<void>;
  deleteAliases: (
    datamartId: string,
    siteId: string,
    organisationId: string,
    eventRuleId: string,
  ) => Promise<DataResponse<Aliases>>;
  getProcessingSelectionsByChannel: (
    channelId: string,
  ) => Promise<DataListResponse<ProcessingSelectionResource>>;
  createProcessingSelectionForChannel: (
    channelId: string,
    body: Partial<ProcessingSelectionResource>,
  ) => Promise<DataResponse<ProcessingSelectionResource>>;
  getChannelProcessingSelection: (
    channelId: string,
    processingSelectionId: string,
  ) => Promise<DataResponse<ProcessingSelectionResource>>;
  deleteChannelProcessingSelection: (
    channelId: string,
    processingSelectionId: string,
  ) => Promise<DataResponse<ProcessingSelectionResource>>;
}

@injectable()
export class ChannelService implements IChannelService {
  getChannels(
    options: object = {},
  ): Promise<DataListResponse<ChannelResourceShape>> {
    const endpoint = `channels`;

    return ApiService.getRequest(endpoint, options);
  }
  getChannel(
    datamartId: string,
    channelId: string,
  ): Promise<DataResponse<ChannelResource>> {
    const endpoint = `datamarts/${datamartId}/channels/${channelId}`;
    return ApiService.getRequest(endpoint);
  }
  updateSite(
    datamartId: string,
    siteId: string,
    body: Partial<SiteResource>,
  ): Promise<DataResponse<SiteResource>> {
    const endpoint = `datamarts/${datamartId}/sites/${siteId}`;
    return ApiService.putRequest(endpoint, body);
  }
  deleteSite(
    datamartId: string,
    siteId: string,
  ): Promise<DataResponse<SiteResource>> {
    const endpoint = `datamarts/${datamartId}/sites/${siteId}`;
    return ApiService.deleteRequest(endpoint);
  }
  updateMobileApplication(
    datamartId: string,
    mobileApplicationId: string,
    body: Partial<MobileApplicationResource>,
  ): Promise<DataResponse<MobileApplicationResource>> {
    const endpoint = `datamarts/${datamartId}/mobile_applications/${mobileApplicationId}`;
    return ApiService.putRequest(endpoint, body);
  }
  deleteMobileApplication(
    datamartId: string,
    mobileApplicationId: string,
  ): Promise<DataResponse<MobileApplicationResource>> {
    const endpoint = `datamarts/${datamartId}/mobile_applications/${mobileApplicationId}`;
    return ApiService.deleteRequest(endpoint);
  }
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
  }
  getEventRules(
    datamartId: string,
    channelId: string,
    organisationId: string,
  ): Promise<DataListResponse<EventRules>> {
    const endpoint = `datamarts/${datamartId}/channels/${channelId}/event_rules`;
    return ApiService.getRequest(endpoint, { organisation_id: organisationId });
  }
  createEventRules(
    datamartId: string,
    channelId: string,
    body: Partial<EventRules>,
  ): Promise<DataResponse<EventRules>> {
    const endpoint = `datamarts/${datamartId}/channels/${channelId}/event_rules`;
    return ApiService.postRequest(endpoint, body);
  }
  updateEventRules(
    datamartId: string,
    channelId: string,
    organisationId: string,
    eventRuleId: string,
    body: Partial<EventRules>,
  ): Promise<DataResponse<EventRules>> {
    const endpoint = `datamarts/${datamartId}/channels/${channelId}/event_rules/${eventRuleId}`;
    return ApiService.putRequest(endpoint, body);
  }
  deleteEventRules(
    datamartId: string,
    channelId: string,
    organisationId: string,
    eventRuleId: string,
  ): Promise<DataResponse<EventRules>> {
    const endpoint = `datamarts/${datamartId}/channels/${channelId}/event_rules/${eventRuleId}`;
    return ApiService.deleteRequest(endpoint);
  }
  getAliases(
    datamartId: string,
    siteId: string,
    organisationId: string,
  ): Promise<DataListResponse<Aliases>> {
    const endpoint = `datamarts/${datamartId}/sites/${siteId}/aliases`;
    return ApiService.getRequest(endpoint, { organisation_id: organisationId });
  }
  createAliases(
    datamartId: string,
    siteId: string,
    body: Partial<Aliases>,
  ): Promise<DataResponse<Aliases>> {
    const endpoint = `datamarts/${datamartId}/sites/${siteId}/aliases`;
    return ApiService.postRequest(endpoint, body);
  }
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
  }
  deleteAliases(
    datamartId: string,
    siteId: string,
    organisationId: string,
    eventRuleId: string,
  ): Promise<DataResponse<Aliases>> {
    const endpoint = `datamarts/${datamartId}/sites/${siteId}/aliases/${eventRuleId}`;
    return ApiService.deleteRequest(endpoint);
  }
  getProcessingSelectionsByChannel(
    channelId: string,
  ): Promise<DataListResponse<ProcessingSelectionResource>> {
    const endpoint = `channels/${channelId}/processing_selections`;
    return ApiService.getRequest(endpoint);
  }
  createProcessingSelectionForChannel(
    channelId: string,
    body: Partial<ProcessingSelectionResource>,
  ): Promise<DataResponse<ProcessingSelectionResource>> {
    const endpoint = `channels/${channelId}/processing_selections`;
    return ApiService.postRequest(endpoint, body);
  }
  getChannelProcessingSelection(
    channelId: string,
    processingSelectionId: string,
  ): Promise<DataResponse<ProcessingSelectionResource>> {
    const endpoint = `channels/${channelId}/processing_selections/${processingSelectionId}`;
    return ApiService.getRequest(endpoint);
  }
  deleteChannelProcessingSelection(
    channelId: string,
    processingSelectionId: string,
  ): Promise<DataResponse<ProcessingSelectionResource>> {
    const endpoint = `channels/${channelId}/processing_selections/${processingSelectionId}`;
    return ApiService.deleteRequest(endpoint);
  }
}

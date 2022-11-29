import { ProcessingSelectionResource } from './../models/processing';
import { ApiService } from '@mediarithmics-private/advanced-components';
import {
  DataListResponse,
  DataResponse,
} from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import {
  EventRules,
  Aliases,
  ChannelResource,
  ChannelResourceShape,
  SiteResource,
  MobileApplicationResource,
  ChannelVisitAnalyzerSelectionResource,
} from '../models/settings/settings';
import { injectable } from 'inversify';

export interface IChannelService {
  getChannels: (
    organisationId: string,
    datamartId: string,
    options?: object,
  ) => Promise<DataListResponse<ChannelResourceShape>>;
  getChannelsByOrganisation: (
    organisationId: string,
    options?: object,
  ) => Promise<DataListResponse<ChannelResourceShape>>;
  getChannel: (datamartId: string, channelId: string) => Promise<DataResponse<ChannelResource>>;
  updateSite: (
    datamartId: string,
    siteId: string,
    body: Partial<SiteResource>,
  ) => Promise<DataResponse<SiteResource>>;
  deleteSite: (datamartId: string, siteId: string) => Promise<DataResponse<SiteResource>>;
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
  getVisitAnalyzerSelections: (
    channelId: string,
  ) => Promise<DataListResponse<ChannelVisitAnalyzerSelectionResource>>;
  getVisitAnalyzerSelection: (
    channelId: string,
    visitAnalyzerSelectionId: string,
  ) => Promise<DataResponse<ChannelVisitAnalyzerSelectionResource>>;
  createVisitAnalyzerSelection: (
    channelId: string,
    visitAnalyzerModelId: string,
  ) => Promise<DataResponse<ChannelVisitAnalyzerSelectionResource>>;
  deleteVisitAnalyzerSelection: (
    channelId: string,
    visitAnalyzerSelectionId: string,
  ) => Promise<void>;
}

@injectable()
export class ChannelService implements IChannelService {
  getChannels(
    organisationId: string,
    datamartId: string,
    options: object = {},
  ): Promise<DataListResponse<ChannelResourceShape>> {
    const endpoint = `datamarts/${datamartId}/channels`;

    const params = {
      organisation_id: organisationId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  }
  getChannelsByOrganisation(
    organisationId: string,
    options: object = {},
  ): Promise<DataListResponse<ChannelResourceShape>> {
    const endpoint = `channels`;
    const params = {
      organisation_id: organisationId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  }
  getChannel(datamartId: string, channelId: string): Promise<DataResponse<ChannelResource>> {
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
  deleteSite(datamartId: string, siteId: string): Promise<DataResponse<SiteResource>> {
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
  getVisitAnalyzerSelections(
    channelId: string,
  ): Promise<DataListResponse<ChannelVisitAnalyzerSelectionResource>> {
    const endpoint = `channels/${channelId}/visit_analyzer_models`;
    return ApiService.getRequest(endpoint);
  }
  getVisitAnalyzerSelection(
    channelId: string,
    visitAnalyzerSelectionId: string,
  ): Promise<DataResponse<ChannelVisitAnalyzerSelectionResource>> {
    const endpoint = `channels/${channelId}/visit_analyzer_models/${visitAnalyzerSelectionId}`;
    return ApiService.getRequest(endpoint);
  }
  createVisitAnalyzerSelection(
    channelId: string,
    visitAnalyzerModelId: string,
  ): Promise<DataResponse<ChannelVisitAnalyzerSelectionResource>> {
    const endpoint = `channels/${channelId}/visit_analyzer_models`;
    const body: Partial<ChannelVisitAnalyzerSelectionResource> = {
      channel_id: channelId,
      visit_analyzer_model_id: visitAnalyzerModelId,
    };
    return ApiService.postRequest(endpoint, body);
  }
  deleteVisitAnalyzerSelection(channelId: string, visitAnalyzerSelectionId: string): Promise<void> {
    const endpoint = `channels/${channelId}/visit_analyzer_models/${visitAnalyzerSelectionId}`;
    return ApiService.deleteRequest(endpoint);
  }
}

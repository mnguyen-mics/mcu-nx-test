import ApiService, { DataListResponse, DataResponse } from './ApiService';
import { AudienceTagFeed } from '../models/Plugins';
import { PluginLayout } from '../models/plugin/PluginLayout';
import { PropertyResourceShape } from '../models/plugin';
import AudienceSegmentFeedService, { GetFeeds } from './AudienceSegmentFeedService';
import { FeedAggregationResponse, FeedAggregationRequest } from '../models/audiencesegment/AudienceFeedsAggregation';
import { injectable } from 'inversify';

export interface IAudienceTagFeedService {
  segmentId: string;

  getFeeds: (
    options: GetFeeds
  ) => Promise<DataListResponse<AudienceTagFeed>>;

  getFeedsAggregationMetrics: (
    body: FeedAggregationRequest,
  ) => Promise<DataResponse<FeedAggregationResponse>>;
  
  getAudienceFeeds: (
    organisationId: string,
    options: object,
  ) => Promise<DataListResponse<AudienceTagFeed>>;

  deleteAudienceFeed: (
    id: string,
    options: object,
  ) => Promise<DataResponse<any>>;

  getInstanceById: (
    id: string,
    options: object,
  ) => Promise<DataResponse<AudienceTagFeed>>;

  getInstanceProperties: (
    id: string,
    options: object,
  ) => Promise<DataListResponse<PropertyResourceShape>>;

  updatePluginInstance: (
    id: string,
    options: object,
  ) => Promise<DataResponse<AudienceTagFeed>>;

  updatePluginInstanceProperty: (
    organisationId: string,
    id: string,
    technicalName: string,
    params: object,
  ) => Promise<DataResponse<PropertyResourceShape> | void>;
  createPluginInstance: (
    organisationId: string,
    options: object,
  ) => Promise<DataResponse<AudienceTagFeed>>;
  getLocalizedPluginLayout(pInstanceId: string): Promise<PluginLayout | null>;
}

@injectable()
export class AudienceTagFeedService
  extends AudienceSegmentFeedService<AudienceTagFeed>
  implements IAudienceTagFeedService {

  getFeeds(options: GetFeeds): Promise<DataListResponse<AudienceTagFeed>> {
    const endpoint = 'audience_segments.tag_feeds';
    return ApiService.getRequest(endpoint, options);
  }

  getFeedsAggregationMetrics = (
    body: FeedAggregationRequest,
  ): Promise<DataResponse<FeedAggregationResponse>> => {
    const endpoint = `audience_segments.tag_feeds/aggregates`

    return ApiService.postRequest(endpoint, body)
  }

  getAudienceFeeds(
    organisationId: string,
    options: object = {},
  ): Promise<DataListResponse<AudienceTagFeed>> {
    const endpoint = 'plugins';

    const params = {
      plugin_type: 'AUDIENCE_SEGMENT_TAG_FEED',
      organisation_id: organisationId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  }

  deleteAudienceFeed(
    id: string,
    options: object = {},
  ): Promise<DataResponse<any>> {
    const endpoint = `audience_segments/${this.segmentId}/tag_feeds/${id}`;

    return ApiService.deleteRequest(endpoint, options);
  }

  // START reimplementation of method

  getInstanceById = (
    id: string,
    options: object = {},
  ): Promise<DataResponse<AudienceTagFeed>> => {
    const endpoint = `audience_segments/${this.segmentId}/tag_feeds/${id}`;

    const params = {
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  };

  getInstanceProperties = (
    id: string,
    options: object = {},
  ): Promise<DataListResponse<PropertyResourceShape>> => {
    const endpoint = `audience_segments/${this.segmentId}/tag_feeds/${id}/properties`;

    return ApiService.getRequest(endpoint, options);
  };

  updatePluginInstance = (
    id: string,
    options: object = {},
  ): Promise<DataResponse<AudienceTagFeed>> => {
    const endpoint = `audience_segments/${this.segmentId}/tag_feeds/${id}`;

    const params = {
      ...options,
    };

    return ApiService.putRequest(endpoint, params);
  };

  updatePluginInstanceProperty = (
    organisationId: string,
    id: string,
    technicalName: string,
    params: object = {},
  ): Promise<DataResponse<PropertyResourceShape> | void> => {
    const endpoint = `audience_segments/${this.segmentId}/tag_feeds/${id}/properties/technical_name=${technicalName}`;
    return this._pluginService.handleSaveOfProperties(
      params,
      organisationId,
      this.entityPath,
      id,
      endpoint,
    );
  };

  createPluginInstance = (
    organisationId: string,
    options: object = {},
  ): Promise<DataResponse<AudienceTagFeed>> => {
    const endpoint = `audience_segments/${this.segmentId}/tag_feeds?organisation_id=${organisationId}`;

    const params = {
      ...options,
    };

    return ApiService.postRequest(endpoint, params);
  };

  getLocalizedPluginLayout(pInstanceId: string): Promise<PluginLayout | null> {
    return this.getInstanceById(pInstanceId).then(res => {
      const audienceTagFeed = res.data;
      return this._pluginService
        .findPluginFromVersionId(audienceTagFeed.version_id)
        .then(pluginResourceRes => {
          const pluginResource = pluginResourceRes.data;
          return this._pluginService.getLocalizedPluginLayout(
            pluginResource.id,
            audienceTagFeed.version_id,
          );
        });
    });
  }
}

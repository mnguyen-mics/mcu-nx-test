import { injectable } from 'inversify';
import { ApiService } from '@mediarithmics-private/advanced-components';
import {
  DataListResponse,
  DataResponse,
} from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { AudienceExternalFeed } from '../models/Plugins';
import { PluginLayout } from '../models/plugin/PluginLayout';
import { PropertyResourceShape } from '../models/plugin';
import AudienceSegmentFeedService, { GetFeeds } from './AudienceSegmentFeedService';
import {
  FeedAggregationResponse,
  FeedAggregationRequest,
} from '../models/audiencesegment/AudienceFeedsAggregation';

export interface IAudienceExternalFeedService {
  segmentId: string;

  getFeeds: (options: GetFeeds) => Promise<DataListResponse<AudienceExternalFeed>>;

  getFeedsAggregationMetrics: (
    body: FeedAggregationRequest,
  ) => Promise<DataResponse<FeedAggregationResponse>>;

  getAudienceFeeds: (
    organisationId: string,
    options: object,
  ) => Promise<DataListResponse<AudienceExternalFeed>>;

  deleteAudienceFeed: (id: string, options: object) => Promise<DataResponse<any>>;

  getInstanceById: (id: string, options: object) => Promise<DataResponse<AudienceExternalFeed>>;

  getInstanceProperties: (
    id: string,
    options: object,
  ) => Promise<DataListResponse<PropertyResourceShape>>;

  updatePluginInstance: (
    id: string,
    options: object,
  ) => Promise<DataResponse<AudienceExternalFeed>>;

  updatePluginInstanceProperty: (
    organisationId: string,
    id: string,
    technicalName: string,
    params: object,
  ) => Promise<DataResponse<PropertyResourceShape> | void>;

  createPluginInstance: (
    organisationId: string,
    options: object,
  ) => Promise<DataResponse<AudienceExternalFeed>>;

  getLocalizedPluginLayout(pInstanceId: string): Promise<PluginLayout | null>;
}

@injectable()
export class AudienceExternalFeedService
  extends AudienceSegmentFeedService<AudienceExternalFeed>
  implements IAudienceExternalFeedService
{
  getFeeds(options: GetFeeds): Promise<DataListResponse<AudienceExternalFeed>> {
    const endpoint = 'audience_segments.external_feeds';
    return ApiService.getRequest(endpoint, options);
  }

  getFeedsAggregationMetrics = (
    body: FeedAggregationRequest,
  ): Promise<DataResponse<FeedAggregationResponse>> => {
    const endpoint = `audience_segments.external_feeds/aggregates`;

    return ApiService.postRequest(endpoint, body);
  };

  getAudienceFeeds(
    organisationId: string,
    options: object = {},
  ): Promise<DataListResponse<AudienceExternalFeed>> {
    const endpoint = 'plugins';

    const params = {
      plugin_type: 'AUDIENCE_SEGMENT_EXTERNAL_FEED',
      organisation_id: organisationId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  }

  deleteAudienceFeed(id: string, options: object = {}): Promise<DataResponse<any>> {
    const endpoint = `audience_segments/${this.segmentId}/external_feeds/${id}`;

    return ApiService.deleteRequest(endpoint, options);
  }

  // START reimplementation of method

  getInstanceById = (
    id: string,
    options: object = {},
  ): Promise<DataResponse<AudienceExternalFeed>> => {
    const endpoint = `audience_segments/${this.segmentId}/external_feeds/${id}`;

    const params = {
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  };

  getInstanceProperties = (
    id: string,
    options: object = {},
  ): Promise<DataListResponse<PropertyResourceShape>> => {
    const endpoint = `audience_segments/${this.segmentId}/external_feeds/${id}/properties`;

    return ApiService.getRequest(endpoint, options);
  };

  updatePluginInstance = (
    id: string,
    options: object = {},
  ): Promise<DataResponse<AudienceExternalFeed>> => {
    const endpoint = `audience_segments/${this.segmentId}/external_feeds/${id}`;
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
    const endpoint = `audience_segments/${this.segmentId}/external_feeds/${id}/properties/technical_name=${technicalName}`;
    return this._pluginService.handleSaveOfProperties(
      params,
      organisationId,
      'audience_external_feeds',
      id,
      endpoint,
    );
  };

  createPluginInstance = (
    organisationId: string,
    options: object = {},
  ): Promise<DataResponse<AudienceExternalFeed>> => {
    const endpoint = `audience_segments/${this.segmentId}/external_feeds?organisation_id=${organisationId}`;

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

export default AudienceExternalFeedService;

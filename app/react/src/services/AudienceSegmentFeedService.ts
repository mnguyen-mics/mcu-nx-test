import AudienceExternalFeedService from './AudienceExternalFeedService';
import {
  AudienceSegmentService,
  IAudienceSegmentService,
} from './AudienceSegmentService';
import PluginInstanceService from './PluginInstanceService';
import { AudienceTagFeed, AudienceExternalFeed, Status } from '../models/Plugins';
import { DataListResponse, DataResponse } from './ApiService';
import { PropertyResourceShape } from '../models/plugin';
import { PluginLayout } from '../models/plugin/PluginLayout';
import {
  AudienceTagFeedService,
} from './AudienceTagFeedService';
import { lazyInject } from '../config/inversify.config';
import { TYPES } from '../constants/types';
import { PaginatedApiParam } from '../utils/ApiHelper';

export type AudienceFeedType = 'EXTERNAL_FEED' | 'TAG_FEED';
type AudienceFeed = AudienceTagFeed | AudienceExternalFeed;

export interface GetFeeds extends PaginatedApiParam {
  organisation_id?: string,
  community_id?: string,
  audience_segment_id?: string,
  status?: Status,
  group_id?: string,
  artifact_id?: string,
  version_id?: string,
  administrated?: boolean
}

export default class AudienceSegmentFeedService extends PluginInstanceService<
  AudienceFeed
> {
  service: AudienceTagFeedService | AudienceExternalFeedService;
  type: AudienceFeedType;
  segmentId: string;
  audienceSegmentService: AudienceSegmentService;

  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceService: IAudienceSegmentService;

  constructor(
    segmentId: string,
    type: AudienceFeedType,
  ) {
    super('audience_feed');
    this.segmentId = segmentId;
    this.type = type;
    this.audienceSegmentService = this._audienceService;

    if (type === 'EXTERNAL_FEED') {
      const audienceExtFeed = new AudienceExternalFeedService(segmentId);
      this.service = audienceExtFeed;
    }
    if (type === 'TAG_FEED') {
      const audienceTagFeed = new AudienceTagFeedService(segmentId);
      this.service = audienceTagFeed;
    }
  }

  getFeeds = (
    options: GetFeeds
  ): Promise<DataListResponse<AudienceFeed>> => {
    return this.service.getFeeds(options);
  }

  getAudienceFeeds = (
    organisationId: string,
    options: object = {},
  ): Promise<DataListResponse<AudienceFeed>> => {
    return this.service.getAudienceFeeds(organisationId, options);
  };

  deleteAudienceFeed = (
    id: string,
    options: object = {},
  ): Promise<DataResponse<any>> => {
    return this.service.deleteAudienceFeed(id, options);
  };

  // START reimplementation of method

  getInstanceById = (
    id: string,
    options: object = {},
  ): Promise<DataResponse<AudienceFeed>> => {
    return this.service.getInstanceById(id, options);
  };

  getInstanceProperties = (
    id: string,
    options: object = {},
  ): Promise<DataListResponse<PropertyResourceShape>> => {
    return this.service.getInstanceProperties(id, options);
  };

  updatePluginInstance = (
    id: string,
    options: object = {},
  ): Promise<DataResponse<AudienceTagFeed>> => {
    return this.service.updatePluginInstance(id, options);
  };

  updatePluginInstanceProperty = (
    organisationId: string,
    id: string,
    technicalName: string,
    params: object = {},
  ): Promise<DataResponse<PropertyResourceShape> | void> => {
    return this.service.updatePluginInstanceProperty(
      organisationId,
      id,
      technicalName,
      params,
    );
  };

  createPluginInstance = (
    organisationId: string,
    options: object = {},
  ): Promise<DataResponse<AudienceTagFeed>> => {
    return this.service.createPluginInstance(organisationId, options);
  };

  // STOP

  // OLD WAY AND DUMB WAY TO DO IT, TO CHANGE
  getAudienceFeedProperties = (id: string, options: object = {}) => {
    return this.service.getAudienceFeedProperties(id, options);
  };

  getLocalizedPluginLayout(pInstanceId: string): Promise<PluginLayout | null> {
    return this.service.getLocalizedPluginLayout(pInstanceId);
  }

  // reimplemention of audience segment service to make them type agnostic
  getAudienceFeed = (feedId: string, options: object = {}) => {
    return this.type === 'EXTERNAL_FEED'
      ? this.audienceSegmentService.getAudienceExternalFeed(
          this.segmentId,
          feedId,
          options,
        )
      : this.audienceSegmentService.getAudienceTagFeed(
          this.segmentId,
          feedId,
          options,
        );
  };

  createAudienceFeed = (
    audienceFeed: Partial<AudienceFeed>,
    options: object = {},
  ) => {
    return this.type === 'EXTERNAL_FEED'
      ? this.audienceSegmentService.createAudienceExternalFeeds(
          this.segmentId,
          audienceFeed,
          options,
        )
      : this.audienceSegmentService.createAudienceTagFeeds(
          this.segmentId,
          audienceFeed,
          options,
        );
  };

  updateAudienceFeed = (
    audienceFeedId: string,
    audienceFeed: Partial<AudienceFeed>,
    options: object = {},
  ) => {
    return this.type === 'EXTERNAL_FEED'
      ? this.audienceSegmentService.updateAudienceExternalFeeds(
          this.segmentId,
          audienceFeedId,
          audienceFeed,
          options,
        )
      : this.audienceSegmentService.updateAudienceTagFeeds(
          this.segmentId,
          audienceFeedId,
          audienceFeed,
          options,
        );
  };

  getAudienceFeedProperty = (feedId: string, options: object = {}) => {
    return this.type === 'EXTERNAL_FEED'
      ? this.audienceSegmentService.getAudienceExternalFeedProperty(
          this.segmentId,
          feedId,
          options,
        )
      : this.audienceSegmentService.getAudienceTagFeedProperty(
          this.segmentId,
          feedId,
          options,
        );
  };

  updateAudienceFeedProperty = (
    organisationId: string,
    id: string,
    technicalName: string,
    params: object = {},
  ) => {
    return this.type === 'EXTERNAL_FEED'
      ? this.audienceSegmentService.updateAudienceSegmentExternalFeedProperty(
          organisationId,
          this.segmentId,
          id,
          technicalName,
          params,
        )
      : this.audienceSegmentService.updateAudienceSegmentTagFeedProperty(
          organisationId,
          this.segmentId,
          id,
          technicalName,
          params,
        );
  };
}

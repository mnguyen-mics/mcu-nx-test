import { IAudienceExternalFeedService } from './AudienceExternalFeedService';
import PluginInstanceService from './PluginInstanceService';
import {
  AudienceTagFeed,
  AudienceExternalFeed,
  PluginProperty,
} from '../models/Plugins';
import { DataListResponse, DataResponse } from './ApiService';
import { PropertyResourceShape } from '../models/plugin';
import { PluginLayout } from '../models/plugin/PluginLayout';
import { IAudienceTagFeedService } from './AudienceTagFeedService';
import { injectable, inject, interfaces } from 'inversify';
import { IAudienceSegmentService } from './AudienceSegmentService';
import { TYPES } from '../constants/types';

export type AudienceFeedType = 'EXTERNAL_FEED' | 'TAG_FEED';
type AudienceFeed = AudienceTagFeed | AudienceExternalFeed;

export interface IAudienceSegmentFeedService {
  segmentId: string;
  feedType: AudienceFeedType;
  getAudienceFeeds: (
    organisationId: string,
    options: object,
  ) => Promise<DataListResponse<AudienceFeed>>;
  deleteAudienceFeed: (
    id: string,
    options?: object,
  ) => Promise<DataResponse<any>>;
  getInstanceById: (
    id: string,
    options: object,
  ) => Promise<DataResponse<AudienceFeed>>;
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
  getAudienceFeedProperties: (
    id: string,
    options: object,
  ) => Promise<DataListResponse<any>>;
  getLocalizedPluginLayout: (
    pInstanceId: string,
  ) => Promise<PluginLayout | null>;
  getAudienceFeed: (
    feedId: string,
    options: object,
  ) => Promise<DataResponse<AudienceExternalFeed | AudienceTagFeed>>;
  createAudienceFeed: (
    audienceFeed: Partial<AudienceFeed>,
    options: object,
  ) => Promise<DataResponse<AudienceExternalFeed | AudienceTagFeed>>;

  updateAudienceFeed: (
    audienceFeedId: string,
    audienceFeed: Partial<AudienceFeed>,
    options?: object,
  ) => Promise<DataResponse<AudienceExternalFeed | AudienceTagFeed>>;
  getAudienceFeedProperty: (
    feedId: string,
    options?: object,
  ) => Promise<DataListResponse<PluginProperty>>;
  updateAudienceFeedProperty: (
    organisationId: string,
    id: string,
    technicalName: string,
    params: object,
  ) => Promise<DataResponse<PluginProperty> | void>;
}

@injectable()
export default class AudienceSegmentFeedService
  extends PluginInstanceService<AudienceFeed>
  implements IAudienceSegmentFeedService {
  feedType: AudienceFeedType;
  segmentId: string;
  private service: IAudienceTagFeedService | IAudienceExternalFeedService;

  @inject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  constructor(
    @inject(TYPES.IAudienceExternalFeedServiceFactory)
    _audienceExternalFeedServiceFactory: interfaces.Factory<
      IAudienceExternalFeedService
    >,
    @inject(TYPES.IAudienceTagFeedServiceFactory)
    _audienceTagFeedServiceFactory: interfaces.Factory<IAudienceTagFeedService>,
  ) {
    super('audience_feed');
    if (this.feedType === 'EXTERNAL_FEED') {
      this.service = _audienceExternalFeedServiceFactory(
        this.segmentId,
      ) as IAudienceExternalFeedService;
    }
    if (this.feedType === 'TAG_FEED') {
      this.service = _audienceTagFeedServiceFactory(
        this.segmentId,
      ) as IAudienceTagFeedService;
    }
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
    return this.feedType === 'EXTERNAL_FEED'
      ? this._audienceSegmentService.getAudienceExternalFeed(
          this.segmentId,
          feedId,
          options,
        )
      : this._audienceSegmentService.getAudienceTagFeed(
          this.segmentId,
          feedId,
          options,
        );
  };

  createAudienceFeed = (
    audienceFeed: Partial<AudienceFeed>,
    options: object = {},
  ) => {
    return this.feedType === 'EXTERNAL_FEED'
      ? this._audienceSegmentService.createAudienceExternalFeeds(
          this.segmentId,
          audienceFeed,
          options,
        )
      : this._audienceSegmentService.createAudienceTagFeeds(
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
    return this.feedType === 'EXTERNAL_FEED'
      ? this._audienceSegmentService.updateAudienceExternalFeeds(
          this.segmentId,
          audienceFeedId,
          audienceFeed,
          options,
        )
      : this._audienceSegmentService.updateAudienceTagFeeds(
          this.segmentId,
          audienceFeedId,
          audienceFeed,
          options,
        );
  };

  getAudienceFeedProperty = (feedId: string, options: object = {}) => {
    return this.feedType === 'EXTERNAL_FEED'
      ? this._audienceSegmentService.getAudienceExternalFeedProperty(
          this.segmentId,
          feedId,
          options,
        )
      : this._audienceSegmentService.getAudienceTagFeedProperty(
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
    return this.feedType === 'EXTERNAL_FEED'
      ? this._audienceSegmentService.updateAudienceSegmentExternalFeedProperty(
          organisationId,
          this.segmentId,
          id,
          technicalName,
          params,
        )
      : this._audienceSegmentService.updateAudienceSegmentTagFeedProperty(
          organisationId,
          this.segmentId,
          id,
          technicalName,
          params,
        );
  };
}

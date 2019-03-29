import { IPluginService } from './PluginService';
import { injectable, inject } from 'inversify';
import ApiService, { DataListResponse, DataResponse } from './ApiService';
import { AudienceExternalFeed } from '../models/Plugins';
import PluginInstanceService from './PluginInstanceService';
import { PluginLayout } from '../models/plugin/PluginLayout';
import { PropertyResourceShape } from '../models/plugin';
import { TYPES } from '../constants/types';

export interface IAudienceExternalFeedService
  extends PluginInstanceService<AudienceExternalFeed> {
  segmentId: string;
  getAudienceFeeds: (
    organisationId: string,
    options: object,
  ) => Promise<DataListResponse<AudienceExternalFeed>>;

  deleteAudienceFeed: (
    id: string,
    options: object,
  ) => Promise<DataResponse<any>>;

  getInstanceById: (
    id: string,
    options: object,
  ) => Promise<DataResponse<AudienceExternalFeed>>;

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

  getAudienceFeedProperties: (
    id: string,
    options: object,
  ) => Promise<DataListResponse<any>>;

  getLocalizedPluginLayout(pInstanceId: string): Promise<PluginLayout | null>;
}

@injectable()
export class AudienceExternalFeedService
  extends PluginInstanceService<AudienceExternalFeed>
  implements IAudienceExternalFeedService {
  segmentId: string;

  @inject(TYPES.IPluginService)
  private _pluginService: IPluginService;

  constructor() {
    super('audience_external_feeds');
  }

  getAudienceFeeds = (
    organisationId: string,
    options: object = {},
  ): Promise<DataListResponse<AudienceExternalFeed>> => {
    const endpoint = 'plugins';

    const params = {
      plugin_type: 'AUDIENCE_SEGMENT_EXTERNAL_FEED',
      organisation_id: organisationId,
      ...options,
    };

    return ApiService.getRequest(endpoint, params);
  };

  deleteAudienceFeed = (
    id: string,
    options: object = {},
  ): Promise<DataResponse<any>> => {
    const endpoint = `audience_segments/${this.segmentId}/external_feeds/${id}`;

    return ApiService.deleteRequest(endpoint, options);
  };

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
    const endpoint = `audience_segments/${
      this.segmentId
    }/external_feeds/${id}/properties`;

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
    const endpoint = `audience_segments/${
      this.segmentId
    }/external_feeds/${id}/properties/technical_name=${technicalName}`;
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
  ): Promise<DataResponse<AudienceExternalFeed>> => {
    const endpoint = `audience_segments/${
      this.segmentId
    }/external_feeds?organisation_id=${organisationId}`;

    const params = {
      ...options,
    };

    return ApiService.postRequest(endpoint, params);
  };

  // STOP

  // OLD WAY AND DUMB WAY TO DO IT, TO CHANGE
  getAudienceFeedProperties = (id: string, options: object = {}) => {
    const endpoint = `audience_segments/${
      this.segmentId
    }/external_feeds/${id}/properties`;

    return ApiService.getRequest(endpoint, options).then((res: any) => {
      return { ...res.data, id };
    });
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

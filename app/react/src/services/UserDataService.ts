import { Activity } from '../models/timeline/timeline';
import {
  UserSegmentResource,
  UserProfileResource,
  UserIdentifierShape,
} from './../models/timeline/timeline';
import ApiService, { DataResponse, DataListResponse } from './ApiService';

type ChannelResource = {
  creation_ts: number;
  datamart_id: string;
  domain: string;
  id: string;
  name: string;
  organisation_id: string;
  token: string;
  type: string;
  visit_analyzer_model_id: string;
};

const UserDataService = {
  getProfile(
    organisationId: string,
    datamartId: string,
    identifierType: string,
    identifierId: string,
    options: object = {},
  ): Promise<DataResponse<UserProfileResource> | undefined> {
    const endpoint =
      identifierType !== 'user_point_id'
        ? `datamarts/${datamartId}/user_profiles/${identifierType}=${identifierId}`
        : `datamarts/${datamartId}/user_profiles/${identifierId}`;

    const params = {
      ...options,
    };

    return ApiService.getRequest<DataResponse<UserProfileResource> | undefined>(
      endpoint,
      params,
    ).catch(error => {
      // api send 404 when channel doesn't exist
      if (error && error.error === 'Resource Not Found') {
        return Promise.resolve(undefined);
      }
      throw error;
    });
  },

  getSegments(
    organisationId: string,
    datamartId: string,
    identifierType: string,
    identifierId: string,
    options: object = {},
  ): Promise<DataListResponse<UserSegmentResource>> {
    const endpoint =
      identifierType !== 'user_point_id'
        ? `datamarts/${datamartId}/user_segments/${identifierType}=${identifierId}`
        : `datamarts/${datamartId}/user_segments/${identifierId}`;

    const params = {
      ...options,
    };

    return ApiService.getRequest<DataListResponse<UserSegmentResource>>(
      endpoint,
      params,
    ).catch(error => {
      // api send 404 when segments don't exist
      if (error && error.error === 'Resource Not Found') {
        const result: DataListResponse<UserSegmentResource> = {
          data: [],
          status: 'ok',
          count: 0,
        };
        return Promise.resolve(result);
      }
      throw error;
    });
  },

  getIdentifiersEndpoint(
    identifierType: string,
    datamartId: string,
    identifierId: string,
    compartmentId?: string,
  ): string {
    switch (identifierType) {
      case 'user_point_id':
        return `datamarts/${datamartId}/user_identifiers/${identifierId}`;
      case 'user_account_id':
        return compartmentId
          ? `datamarts/${datamartId}/user_identifiers/compartment_id=${compartmentId}/${identifierType}=${identifierId}`
          : `datamarts/${datamartId}/user_identifiers/${identifierType}=${identifierId}`;
      default:
        return `datamarts/${datamartId}/user_identifiers/${identifierType}=${identifierId}`;
    }
  },

  getIdentifiers(
    organisationId: string,
    datamartId: string,
    identifierType: string,
    identifierId: string,
    compartmentId?: string,
    options: object = {},
  ): Promise<DataListResponse<UserIdentifierShape>> {
    const endpoint = UserDataService.getIdentifiersEndpoint(
      identifierType,
      datamartId,
      identifierId,
      compartmentId,
    );

    const params = {
      ...options,
    };

    return ApiService.getRequest<DataListResponse<UserIdentifierShape>>(
      endpoint,
      params,
    ).catch(error => {
      // api send 404 when identifiers don't exist
      if (error && error.error === 'Resource Not Found') {
        const result: DataListResponse<UserIdentifierShape> = {
          data: [],
          status: 'ok',
          count: 0,
        };
        return Promise.resolve(result);
      }
      throw error;
    });
  },

  getActivities(
    datamartId: string,
    identifierType: string,
    identifierId: string,
    options: object = {},
  ): Promise<DataListResponse<Activity>> {
    const endpoint =
      identifierType !== 'user_point_id'
        ? `datamarts/${datamartId}/user_timelines/${identifierType}=${identifierId}/user_activities`
        : `datamarts/${datamartId}/user_timelines/${identifierId}/user_activities`;

    const params = {
      ...options,
    };

    return ApiService.getRequest<DataListResponse<Activity>>(
      endpoint,
      params,
    ).catch(error => {
      // api send 404 when activities don't exist
      if (error && error.error === 'Resource Not Found') {
        const result: DataListResponse<Activity> = {
          data: [],
          status: 'ok',
          count: 0,
        };
        return Promise.resolve(result);
      }
      throw error;
    });
  },

  getChannel(
    datamartId: string,
    channelId: string,
  ): Promise<DataResponse<ChannelResource> | undefined> {
    const endpoint = `datamarts/${datamartId}/channels/${channelId}`;

    return ApiService.getRequest<DataResponse<ChannelResource> | undefined>(
      endpoint,
    ).catch(error => {
      // api send 404 when channel doesn't exist
      if (error && error.error === 'Resource Not Found') {
        return Promise.resolve(undefined);
      }
      throw error;
    });
  },
};

export default UserDataService;

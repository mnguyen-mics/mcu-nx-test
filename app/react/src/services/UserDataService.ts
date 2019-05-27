import {
  UserSegmentResource,
  UserProfileResource,
  Activity,
  UserIdentifierInfo,
} from './../models/timeline/timeline';
import ApiService, { DataResponse, DataListResponse } from './ApiService';
import { Identifier } from '../containers/Audience/Timeline/Monitoring';
import { injectable } from 'inversify';

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

export interface IUserDataService {
  getProfile: (
    datamartId: string,
    identifier: Identifier,
    options?: object,
  ) => Promise<DataResponse<UserProfileResource> | undefined>;

  getSegments: (
    datamartId: string,
    identifier: Identifier,
    options?: object,
  ) => Promise<DataListResponse<UserSegmentResource>>;

  getIdentifiersEndpoint: (
    identifierType: string,
    datamartId: string,
    identifierId: string,
    compartmentId?: string,
  ) => string;

  getIdentifiers: (
    organisationId: string,
    datamartId: string,
    identifierType: string,
    identifierId: string,
    compartmentId?: string,
    options?: object,
  ) => Promise<DataListResponse<UserIdentifierInfo>>;

  getActivities: (
    datamartId: string,
    identifier: Identifier,
    options?: object,
  ) => Promise<DataListResponse<Activity>>;

  getChannel: (
    datamartId: string,
    channelId: string,
  ) => Promise<DataResponse<ChannelResource> | undefined>;
}

@injectable()
export class UserDataService implements IUserDataService {
  getProfile(
    datamartId: string,
    identifier: Identifier,
    options: object = {},
  ): Promise<DataResponse<UserProfileResource> | undefined> {
    const endpoint =
      identifier.type !== 'user_point_id'
        ? `datamarts/${datamartId}/user_profiles/${identifier.type}=${
            identifier.id
          }`
        : `datamarts/${datamartId}/user_profiles/${identifier.id}`;

    const params = {
      ...options,
      compartment_id: identifier.compartmentId,
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
  }

  getSegments(
    datamartId: string,
    identifier: Identifier,
    options: object = {},
  ): Promise<DataListResponse<UserSegmentResource>> {
    const inBetweenCompartmentId = identifier.compartmentId
      ? `compartment_id=${identifier.compartmentId}/`
      : ``;
    const endpoint =
      identifier.type !== 'user_point_id'
        ? identifier.type === 'user_account_id'
          ? `datamarts/${datamartId}/user_segments/${inBetweenCompartmentId}${
              identifier.type
            }=${identifier.id}`
          : `datamarts/${datamartId}/user_segments/${identifier.type}=${
              identifier.id
            }`
        : `datamarts/${datamartId}/user_segments/${identifier.id}`;

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
  }

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
  }

  getIdentifiers(
    organisationId: string,
    datamartId: string,
    identifierType: string,
    identifierId: string,
    compartmentId?: string,
    options: object = {},
  ): Promise<DataListResponse<UserIdentifierInfo>> {
    const endpoint = this.getIdentifiersEndpoint(
      identifierType,
      datamartId,
      identifierId,
      compartmentId,
    );

    const params = {
      ...options,
    };

    return ApiService.getRequest<DataListResponse<UserIdentifierInfo>>(
      endpoint,
      params,
    ).catch(error => {
      // api send 404 when identifiers don't exist
      if (error && error.error === 'Resource Not Found') {
        const result: DataListResponse<UserIdentifierInfo> = {
          data: [],
          status: 'ok',
          count: 0,
        };
        return Promise.resolve(result);
      }
      throw error;
    });
  }

  getActivities(
    datamartId: string,
    identifier: Identifier,
    options: object = {},
  ): Promise<DataListResponse<Activity>> {
    const inBetweenCompartmentId = identifier.compartmentId
      ? `compartment_id=${identifier.compartmentId}/`
      : ``;
    const endpoint =
      identifier.type !== 'user_point_id'
        ? identifier.type === 'user_account_id'
          ? `datamarts/${datamartId}/user_timelines/${inBetweenCompartmentId}${
              identifier.type
            }=${identifier.id}/user_activities`
          : `datamarts/${datamartId}/user_timelines/${identifier.type}=${
              identifier.id
            }/user_activities`
        : `datamarts/${datamartId}/user_timelines/${
            identifier.id
          }/user_activities`;

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
  }

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
  }
}

export default UserDataService;

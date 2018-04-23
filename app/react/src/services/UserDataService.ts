import ApiService, { DataResponse } from './ApiService';

type ChannelResource = any; // type it  better

const UserDataService = {
  getProfile(
    organisationId: string,
    datamartId: string,
    identifierType: string,
    identifierId: string,
    options: object = {},
  ) {
    const endpoint =
      identifierType !== 'user_point_id'
        ? `datamarts/${datamartId}/user_profiles/${identifierType}=${identifierId}`
        : `datamarts/${datamartId}/user_profiles/${identifierId}`;

    const params = {
      ...options,
    };

    return ApiService.getRequest(endpoint, params).catch(error => {
      // api send 404 when profile doesn't exist
      if (error && error.error === 'Resource Not Found') {
        return Promise.resolve({ data: {} });
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
  ) {
    const endpoint =
      identifierType !== 'user_point_id'
        ? `datamarts/${datamartId}/user_segments/${identifierType}=${identifierId}`
        : `datamarts/${datamartId}/user_segments/${identifierId}`;

    const params = {
      ...options,
    };

    return ApiService.getRequest(endpoint, params).catch(error => {
      // api send 404 when segments doesn't exist
      if (error && error.error === 'Resource Not Found') {
        return Promise.resolve({ data: [] });
      }
      throw error;
    });
  },

  getIdentifiers(
    organisationId: string,
    datamartId: string,
    identifierType: string,
    identifierId: string,
    options: object = {},
  ) {
    const endpoint =
      identifierType !== 'user_point_id'
        ? `datamarts/${datamartId}/user_identifiers/${identifierType}=${identifierId}`
        : `datamarts/${datamartId}/user_identifiers/${identifierId}`;

    const params = {
      ...options,
    };

    return ApiService.getRequest(endpoint, params).catch(error => {
      // api send 404 when identifiers doesn't exist
      if (error && error.error === 'Resource Not Found') {
        return Promise.resolve({ data: {} });
      }
      throw error;
    });
  },

  getActivities(
    organisationId: string,
    datamartId: string,
    identifierType: string,
    identifierId: string,
    options: object = {},
  ) {
    const endpoint =
      identifierType !== 'user_point_id'
        ? `datamarts/${datamartId}/user_timelines/${identifierType}=${identifierId}/user_activities`
        : `datamarts/${datamartId}/user_timelines/${identifierId}/user_activities`;

    const params = {
      ...options,
    };

    return ApiService.getRequest(endpoint, params).catch(error => {
      // api send 404 when activities doesn't exist
      if (error && error.error === 'Resource Not Found') {
        return Promise.resolve({ data: [] });
      }
      throw error;
    });
  },

  getChannel(datamartId: string, channelId: string): Promise<DataResponse<ChannelResource>> {
    const endpoint = `datamarts/${datamartId}/channels/${channelId}`;

    return ApiService.getRequest(endpoint);
    // return ApiService.getRequest(endpoint, {}).catch(error => {
    //   // api send 404 when channel doesn't exist
    //   if (error && error.error === 'Resource Not Found') {
    //     return Promise.resolve({ data: {} });
    //   }
    //   throw error;
    // });
  },
};

export default UserDataService;

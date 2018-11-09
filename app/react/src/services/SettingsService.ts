import ApiService, { DataResponse } from './ApiService';
import UserResource from '../models/directory/UserResource';

const SettingsService = {
  putProfile(organisationId: string, userProfile: UserResource): Promise<DataResponse<UserResource>> {
    const id = userProfile.id;
    const endpoint = `users/${id}?organisation_id=${organisationId}`;
  
    const params = {
      ...userProfile,
    };
  
    return ApiService.putRequest(endpoint, params);
  }
}

export default SettingsService;

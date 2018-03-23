import ApiService, { DataResponse } from './ApiService';
import { User } from '../models/settings/settings';

const SettingsService = {
  putProfile(organisationId: string, userProfile: User): Promise<DataResponse<User>> {
    const id = userProfile.id;
    const endpoint = `users/${id}?organisation_id=${organisationId}`;
  
    const params = {
      ...userProfile,
    };
  
    return ApiService.putRequest(endpoint, params);
  }
}

export default SettingsService;

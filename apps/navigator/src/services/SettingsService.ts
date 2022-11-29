import { ApiService } from '@mediarithmics-private/advanced-components';
import { DataResponse } from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import UserResource from '../models/directory/UserResource';
import { injectable } from 'inversify';

export interface ISettingsService {
  putProfile: (
    organisationId: string,
    userProfile: UserResource,
  ) => Promise<DataResponse<UserResource>>;
}

@injectable()
export class SettingsService implements ISettingsService {
  putProfile(
    organisationId: string,
    userProfile: UserResource,
  ): Promise<DataResponse<UserResource>> {
    const id = userProfile.id;
    const endpoint = `users/${id}?organisation_id=${organisationId}`;

    const params = {
      ...userProfile,
    };

    return ApiService.putRequest(endpoint, params);
  }
}

import ApiService, { DataResponse } from './ApiService';
import { injectable } from 'inversify';
import { DimensionsList } from '../models/datamartUsersAnalytics/datamartUsersAnalytics';

export interface IUsersAnalyticsService {
  getDimensions: (
    datamartId: string
  ) => Promise<DataResponse<DimensionsList>>;
}

@injectable()
export class UsersAnalyticsService implements IUsersAnalyticsService {
  getDimensions(
    datamartId: string
  ): Promise<DataResponse<DimensionsList>> {
    const endpoint = `datamarts/${datamartId}/user_activities_analytics/dimensions`;

    return ApiService.getRequest(endpoint);
  }
}

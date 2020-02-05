import ApiService from './ApiService';
import { injectable } from 'inversify';
import { ReportViewResponse } from './ReportService';
import { ReportRequestBody } from '../models/ReportRequestBody';
import { 
  buildDatamartUsersAnalyticsRequestBody, 
  DatamartUsersAnalyticsDimension, 
  DatamartUsersAnalyticsMetric 
} from '../utils/DatamartUsersAnalyticsReportHelper';

export interface IDatamartUsersAnalyticsService {
  getAnalytics: (
    datamartId: string,
    metric: DatamartUsersAnalyticsMetric,
    dimension?: DatamartUsersAnalyticsDimension
  ) => Promise<ReportViewResponse>;
}

@injectable()
export class DatamartUsersAnalyticsService implements IDatamartUsersAnalyticsService {
  getAnalytics(
    datamartId: string,
    metric: DatamartUsersAnalyticsMetric,
    dimension?: DatamartUsersAnalyticsDimension
  ): Promise<ReportViewResponse> {
    const report: ReportRequestBody = buildDatamartUsersAnalyticsRequestBody(datamartId, metric, dimension);
    const endpoint = `datamarts/${datamartId}/user_activities_analytics`;
    return ApiService.postRequest(endpoint, report);
  }
}

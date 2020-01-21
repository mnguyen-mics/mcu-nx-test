import ApiService from './ApiService';
import { injectable } from 'inversify';
import { ReportViewResponse } from './ReportService';
import { ReportRequestBody } from '../models/ReportRequestBody';
import { buildDatamartUsersAnalyticsRequestBody } from '../utils/DatamartUsersAnalyticsReportHelper';

/// /datamarts/{datamart_id}/user_activities_analytics
export interface IDatamartUsersAnalyticsService {
  getAnalytics: (
    datamartId: string,
  ) => Promise<ReportViewResponse>;
}

@injectable()
export class DatamartUsersAnalyticsService implements IDatamartUsersAnalyticsService {
  getAnalytics(
    datamartId: string,
  ): Promise<ReportViewResponse> {
    const report: ReportRequestBody = buildDatamartUsersAnalyticsRequestBody(datamartId);
    const endpoint = `datamarts/${datamartId}/user_activities_analytics`;
    return ApiService.postRequest(endpoint, report);
  }
}

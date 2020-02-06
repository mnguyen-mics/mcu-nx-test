import ApiService from './ApiService';
import { injectable } from 'inversify';
import { ReportViewResponse } from './ReportService';
import { ReportRequestBody, DimensionFilterClause } from '../models/ReportRequestBody';
import { 
  buildDatamartUsersAnalyticsRequestBody, 
  DatamartUsersAnalyticsDimension, 
  DatamartUsersAnalyticsMetric 
} from '../utils/DatamartUsersAnalyticsReportHelper';

export interface IDatamartUsersAnalyticsService {
  getAnalytics: (
    datamartId: string,
    metric: DatamartUsersAnalyticsMetric,
    dimension?: DatamartUsersAnalyticsDimension,
    dimensionFilterClauses?: DimensionFilterClause
  ) => Promise<ReportViewResponse>;
}

@injectable()
export class DatamartUsersAnalyticsService implements IDatamartUsersAnalyticsService {
  getAnalytics(
    datamartId: string,
    metric: DatamartUsersAnalyticsMetric,
    dimension?: DatamartUsersAnalyticsDimension,
    dimensionFilterClauses?: DimensionFilterClause
  ): Promise<ReportViewResponse> {
    const report: ReportRequestBody = buildDatamartUsersAnalyticsRequestBody(datamartId, metric, dimension, dimensionFilterClauses);
    const endpoint = `datamarts/${datamartId}/user_activities_analytics`;
    return ApiService.postRequest(endpoint, report);
  }
}

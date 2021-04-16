import ApiService from './ApiService';
import { injectable } from 'inversify';
import { ReportViewResponse } from './ReportService';
import { ReportRequestBody, DimensionFilterClause } from '../models/ReportRequestBody';
import { 
  buildDatamartUsersAnalyticsRequestBody, 
  DatamartUsersAnalyticsDimension, 
  DatamartUsersAnalyticsMetric 
} from '../utils/DatamartUsersAnalyticsReportHelper';
import McsMoment from '../utils/McsMoment';

export interface IDatamartUsersAnalyticsService {
  getAnalytics: (
    datamartId: string,
    metrics: DatamartUsersAnalyticsMetric[],
    from: McsMoment,
    to: McsMoment,
    dimensions?: DatamartUsersAnalyticsDimension[],
    dimensionFilterClauses?: DimensionFilterClause,
    segmentId?: string,
    segmentIdToAdd?: string,
    sampling?: number
  ) => Promise<ReportViewResponse>;
}

@injectable()
export class DatamartUsersAnalyticsService implements IDatamartUsersAnalyticsService {
  getAnalytics(
    datamartId: string,
    metrics: DatamartUsersAnalyticsMetric[],
    from: McsMoment,
    to: McsMoment,
    dimensions?: DatamartUsersAnalyticsDimension[],
    dimensionFilterClauses?: DimensionFilterClause,
    segmentId?: string,
    segmentIdToAggregate?: string,
    sampling?: number
  ): Promise<ReportViewResponse> {
    const report: ReportRequestBody = buildDatamartUsersAnalyticsRequestBody(datamartId, metrics, from, to, dimensions, dimensionFilterClauses, segmentId, segmentIdToAggregate, sampling);
    const endpoint = `datamarts/${datamartId}/user_activities_analytics`;
    return ApiService.postRequest(endpoint, report);
  }
}

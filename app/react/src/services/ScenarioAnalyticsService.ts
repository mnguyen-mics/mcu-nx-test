import ApiService from './ApiService';
import { injectable } from 'inversify';
import { ReportViewResponse } from './ReportService';
import {
  ReportRequestBody,
  DimensionFilterClause,
} from '../models/ReportRequestBody';
import {
  buildScenarioAnalyticsRequestBody,
  ScenarioAnalyticsDimension,
  ScenarioAnalyticsMetric,
} from '../utils/ScenarioAnalyticsReportHelper';
import McsMoment from '../utils/McsMoment';

export interface IScenarioAnalyticsService {
  getAnalytics: (
    datamartId: string,
    metrics: ScenarioAnalyticsMetric[],
    from: McsMoment,
    to: McsMoment,
    dimensions?: ScenarioAnalyticsDimension[],
    dimensionFilterClauses?: DimensionFilterClause,
  ) => Promise<ReportViewResponse>;
}

@injectable()
export class ScenarioAnalyticsService
  implements IScenarioAnalyticsService {
  getAnalytics(
    datamartId: string,
    metrics: ScenarioAnalyticsMetric[],
    from: McsMoment,
    to: McsMoment,
    dimensions?: ScenarioAnalyticsDimension[],
    dimensionFilterClauses?: DimensionFilterClause,
  ): Promise<ReportViewResponse> {
    const report: ReportRequestBody = buildScenarioAnalyticsRequestBody(
      metrics,
      from,
      to,
      dimensions,
      dimensionFilterClauses,
    );
    const endpoint = `datamarts/${datamartId}/scenario_analytics`;
    return ApiService.postRequest(endpoint, report);
  }
}

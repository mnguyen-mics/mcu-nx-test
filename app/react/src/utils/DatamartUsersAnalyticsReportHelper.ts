import {
  ReportRequestBody,
  DateRange,
  Dimension,
  Metric,
  DimensionFilterClause,
} from '../models/ReportRequestBody';
import McsMoment from './McsMoment';

export type DatamartUsersAnalyticsDimension = 'date_yyyy_mm_dd';
export type DatamartUsersAnalyticsMetric = 'sessions' | 'avg_session_duration';

export function buildDatamartUsersAnalyticsRequestBody(
  datamartId: string,
  metric: DatamartUsersAnalyticsMetric,
  dimension?: DatamartUsersAnalyticsDimension,
  dimensionFilterClauses?: DimensionFilterClause
): ReportRequestBody {
  const date7daysAgo: string = new McsMoment('now-7d').toMoment().utc(false).startOf('day').format().replace('Z', '');
  const dimensionsList: DatamartUsersAnalyticsDimension[] = [];
  if (dimension) {
    dimensionsList.push(dimension);
  }
  const metricsList: DatamartUsersAnalyticsMetric[] = [metric];
  return buildReport(date7daysAgo, dimensionsList, metricsList, dimensionFilterClauses);
}

function buildReport(
  startDate: string,
  dimensionsList: DatamartUsersAnalyticsDimension[],
  metricsList: DatamartUsersAnalyticsMetric[],
  dimensionFilterClauses?: DimensionFilterClause
): ReportRequestBody {

  // DATE RANGE
  const dateNow: string = new McsMoment('now-1d').toMoment().utc(false).endOf('day').format().replace('Z', '');

  const dateRange: DateRange = {
    start_date: startDate,
    end_date: dateNow,
  };

  const dateRanges: DateRange[] = [dateRange];

  // DIMENSIONS
  const dimensions: Dimension[] = dimensionsList.map(dimension => {
    return { name: dimension };
  });

  // METRICS
  const metrics: Metric[] = metricsList.map(metric => {
    return { expression: metric };
  });

  const report: ReportRequestBody = {
    date_ranges: dateRanges,
    dimensions: dimensions,
    dimension_filter_clauses: dimensionFilterClauses,
    metrics: metrics,
  };
  return report;
}

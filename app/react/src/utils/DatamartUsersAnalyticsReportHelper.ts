import {
  ReportRequestBody,
  DateRange,
  Dimension,
  Metric,
} from '../models/ReportRequestBody';
import McsMoment from './McsMoment';

export type DatamartUsersAnalyticsDimension = 'date_yyyy_mm_dd';
export type DatamartUsersAnalyticsMetric = 'sessions' | 'avg_session_duration';

export function buildDatamartUsersAnalyticsRequestBody(
  datamartId: string,
  metric: DatamartUsersAnalyticsMetric,
  dimension?: DatamartUsersAnalyticsDimension
): ReportRequestBody {
  const date7daysAgo: string = new McsMoment('now-7d').toMoment().format();
  let dimensionsList: DatamartUsersAnalyticsDimension[] = [];
  if (dimension) {
    dimensionsList.push(dimension);
  }
  const metricsList: DatamartUsersAnalyticsMetric[] = [metric];
  return buildReport(date7daysAgo, dimensionsList, metricsList);
}

function buildReport(
  startDate: string,
  dimensionsList: DatamartUsersAnalyticsDimension[],
  metricsList: DatamartUsersAnalyticsMetric[]
): ReportRequestBody {

  // DATE RANGE
  const dateNow: string = new McsMoment('now-1d').toMoment().endOf('day').format();

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
    metrics: metrics,
  };
  return report;
}

import {
  ReportRequestBody,
  DateRange,
  Dimension,
  Metric,
} from '../models/ReportRequestBody';
import McsMoment from './McsMoment';

type DatamartUsersAnalyticsDimension = 'date_yyyy_mm_dd';
type DatamartUsersAnalyticsMetric = 'sessions';

export function buildDatamartUsersAnalyticsRequestBody(
  datamartId: string,
): ReportRequestBody {
  const date7daysAgo: string = new McsMoment('now-7d').toMoment().startOf('day').format();
  const dimensionsList: DatamartUsersAnalyticsDimension[] = ['date_yyyy_mm_dd'];
  const metricsList: DatamartUsersAnalyticsMetric[] = ['sessions'];
  return buildReport(date7daysAgo, dimensionsList, metricsList, datamartId);
}

function buildReport(
  startDate: string,
  dimensionsList: DatamartUsersAnalyticsDimension[],
  metricsList: DatamartUsersAnalyticsMetric[],
  datamartId: string,
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

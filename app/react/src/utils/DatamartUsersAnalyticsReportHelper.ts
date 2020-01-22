import {
  ReportRequestBody,
  DateRange,
  Dimension,
  Metric,
} from '../models/ReportRequestBody';
import McsMoment from './McsMoment';

type DatamartUsersAnalyticsDimension = 'date_yyyymmddhh';
type DatamartUsersAnalyticsMetric = 'sessions';

export function buildDatamartUsersAnalyticsRequestBody(
  datamartId: string,
): ReportRequestBody {
  const date7daysAgo: string = new McsMoment('now-7d').toMoment().format();
  const dimensionsList: DatamartUsersAnalyticsDimension[] = ['date_yyyymmddhh'];
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
  const dateNow: string = new McsMoment('now').toMoment().format();

  const dateRange: DateRange = {
    start_date: startDate,
    end_date: dateNow,
  };

  const dateRanges: DateRange[] = [dateRange];

  // DIMENSIONS
  const dimensions: Dimension[] = dimensionsList.map(dimension => {
    return { name: dimension };
  });

  // DIMENSION FILTERS
  // const dimensionFilter: DimensionFilter = {
  //   dimension_name: 'DATAMART_ID',
  //   operator: 'EXACT',
  //   expressions: [datamartId],
  // };

  // const dimensionsFilterClauses: DimensionFilterClause = {
  //   operator: 'OR',
  //   filters: [dimensionFilter],
  // };

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

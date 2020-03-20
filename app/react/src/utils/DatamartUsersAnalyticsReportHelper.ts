import {
  ReportRequestBody,
  DateRange,
  Dimension,
  Metric,
  DimensionFilterClause,
} from '../models/ReportRequestBody';
import McsMoment from './McsMoment';

export type DatamartUsersAnalyticsDimension = 'date_yyyy_mm_dd' | 'channel_id' | 'channel_name';
export type DatamartUsersAnalyticsMetric = 'users'| 'sessions' | 'avg_session_duration' | 'avg_number_of_user_events';

export function buildDatamartUsersAnalyticsRequestBody(
  datamartId: string,
  metrics: DatamartUsersAnalyticsMetric[],
  from: McsMoment,
  to: McsMoment,
  dimensions?: DatamartUsersAnalyticsDimension[],
  dimensionFilterClauses?: DimensionFilterClause
): ReportRequestBody {
  const startDate: string = new McsMoment(from.value).toMoment().utc(false).startOf('day').format().replace('Z', '');
  const endDate: string = new McsMoment(to.value).toMoment().utc(false).endOf('day').format().replace('Z', '');
  const dimensionsList: DatamartUsersAnalyticsDimension[] = dimensions || [];
  return buildReport(startDate, endDate, dimensionsList, metrics, dimensionFilterClauses);
}

function buildReport(
  startDate: string,
  endDate: string,
  dimensionsList: DatamartUsersAnalyticsDimension[],
  metricsList: DatamartUsersAnalyticsMetric[],
  dimensionFilterClauses?: DimensionFilterClause
): ReportRequestBody {

  const dateRange: DateRange = {
    start_date: startDate,
    end_date: endDate,
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

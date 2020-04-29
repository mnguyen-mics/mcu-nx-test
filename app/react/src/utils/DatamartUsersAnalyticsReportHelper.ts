import {
  ReportRequestBody,
  DateRange,
  Dimension,
  Metric,
  DimensionFilterClause,
} from '../models/ReportRequestBody';
import McsMoment from './McsMoment';

export type DatamartUsersAnalyticsDimension = 'date_yyyy_mm_dd' 
                                              | 'channel_id' 
                                              | 'channel_name' 
                                              | 'device_form_factor' 
                                              | 'device_browser_family' 
                                              | 'device_os_family'
                                              | 'origin_source'
                                              | 'origin_channel'
                                              | 'resource_name';

export type DatamartUsersAnalyticsMetric = 'users'
                                            | 'sessions' 
                                            | 'avg_session_duration' 
                                            | 'avg_number_of_user_events' 
                                            | 'conversion_rate' 
                                            | 'number_of_transactions'
                                            | 'avg_transaction_amount'
                                            | 'revenue';

export function buildDatamartUsersAnalyticsRequestBody(
  datamartId: string,
  metrics: DatamartUsersAnalyticsMetric[],
  from: McsMoment,
  to: McsMoment,
  dimensions?: DatamartUsersAnalyticsDimension[],
  dimensionFilterClauses?: DimensionFilterClause,
  segmentId?: string
): ReportRequestBody {
  const startDate: string = new McsMoment(from.value).toMoment().utc(false).startOf('day').format().replace('Z', '');
  const endDate: string = new McsMoment(to.value).toMoment().utc(false).endOf('day').format().replace('Z', '');
  const dimensionsList: DatamartUsersAnalyticsDimension[] = dimensions || [];
  return buildReport(startDate, endDate, dimensionsList, metrics, dimensionFilterClauses, segmentId);
}

function buildReport(
  startDate: string,
  endDate: string,
  dimensionsList: DatamartUsersAnalyticsDimension[],
  metricsList: DatamartUsersAnalyticsMetric[],
  dimensionFilterClauses?: DimensionFilterClause,
  segmentId?: string
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

  const dimensionFilterClausesCopy  = dimensionFilterClauses ? {...dimensionFilterClauses} : undefined;

  if (dimensionFilterClausesCopy && segmentId) {
    dimensionFilterClausesCopy.operator = 'AND';
    const filters = dimensionFilterClausesCopy.filters.slice();
    filters.push({
      dimension_name: 'segment_id',
      not: false,
      operator: 'EXACT',
      expressions: [
        segmentId
      ],
      case_sensitive: false
    });
    
    dimensionFilterClausesCopy.filters = filters;
  }

  const report: ReportRequestBody = {
    date_ranges: dateRanges,
    dimensions: dimensions,
    dimension_filter_clauses: dimensionFilterClausesCopy,
    metrics: metrics,
  };
  return report;
}

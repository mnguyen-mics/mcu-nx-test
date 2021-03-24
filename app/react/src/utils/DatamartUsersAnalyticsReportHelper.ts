import {
  ReportRequestBody,
  DateRange,
  Dimension,
  Metric,
  DimensionFilterClause,
} from '../models/ReportRequestBody';
import McsMoment, { isNowFormat } from './McsMoment';

export type DatamartUsersAnalyticsDimension = 'date_yyyy_mm_dd' 
                                              | 'channel_id' 
                                              | 'channel_name' 
                                              | 'device_form_factor' 
                                              | 'device_browser_family' 
                                              | 'device_os_family'
                                              | 'origin_source'
                                              | 'origin_channel'
                                              | 'resource_name'
                                              | 'number_of_confirmed_transactions'
                                              | 'event_type';

export type DatamartUsersAnalyticsMetric = 'users'
                                            | 'sessions' 
                                            | 'avg_session_duration' 
                                            | 'avg_number_of_user_events' 
                                            | 'conversion_rate' 
                                            | 'avg_number_of_transactions'
                                            | 'number_of_transactions'
                                            | 'avg_transaction_amount'
                                            | 'avg_revenue_per_user_point'
                                            | 'revenue';



export function buildDatamartUsersAnalyticsRequestBody(
  datamartId: string,
  metrics: DatamartUsersAnalyticsMetric[],
  from: McsMoment,
  to: McsMoment,
  dimensions?: DatamartUsersAnalyticsDimension[],
  dimensionFilterClauses?: DimensionFilterClause,
  segmentId?: string,
  segmentIdToAdd?: string,
): ReportRequestBody {
  const UTC = !(isNowFormat(from.value) && isNowFormat(to.value));
  const startDate = new McsMoment(from.value).toMoment().utc(UTC).startOf('day').format().replace('Z', '');
  const endDate = new McsMoment(to.value).toMoment().utc(UTC).endOf('day').format().replace('Z', '');
  const dimensionsList: DatamartUsersAnalyticsDimension[] = dimensions || [];
  return buildReport(dimensionsList, metrics, startDate, endDate, dimensionFilterClauses, segmentId, segmentIdToAdd);
}

function buildReport(
  dimensionsList: DatamartUsersAnalyticsDimension[],
  metricsList: DatamartUsersAnalyticsMetric[],
  startDate: string,
  endDate: string,
  dimensionFilterClauses?: DimensionFilterClause,
  segmentId?: string,
  segmentIdToAggregate?: string,
): ReportRequestBody {

    const dateRange: DateRange = {
      start_date: startDate,
      end_date: endDate,
    };
    const dateRanges = [dateRange];
  
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
    const hasSegmentFilter = dimensionFilterClausesCopy.filters.find(filter => filter.expressions[0] === segmentId);
    dimensionFilterClausesCopy.operator = 'AND';
    const filters = dimensionFilterClausesCopy.filters.slice();
    
    if (!hasSegmentFilter) {
      filters.push({
        dimension_name: 'segment_id',
        not: false,
        operator: 'EXACT',
        expressions: [
          segmentId
        ],
        case_sensitive: false
      });
    }

    if(segmentIdToAggregate) {
      filters.push({
        dimension_name: 'segment_id',
        not: false,
        operator: 'EXACT',
        expressions: [
          segmentIdToAggregate
        ],
        case_sensitive: false
      });
    }
    
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

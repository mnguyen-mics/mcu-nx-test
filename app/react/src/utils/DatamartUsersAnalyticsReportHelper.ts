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
                                              | 'resource_name';

export type DatamartUsersAnalyticsMetric = 'users'
                                            | 'sessions' 
                                            | 'avg_session_duration' 
                                            | 'avg_number_of_user_events' 
                                            | 'conversion_rate' 
                                            | 'avg_number_of_transactions'
                                            | 'avg_transaction_amount'
                                            | 'avg_revenue_per_user_point';



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
  const startDate: string = new McsMoment(from.value).toMoment().utc(UTC).startOf('day').format().replace('Z', '');
  const endDate: string = new McsMoment(to.value).toMoment().utc(UTC).endOf('day').format().replace('Z', '');
  const dimensionsList: DatamartUsersAnalyticsDimension[] = dimensions || [];
  return buildReport(startDate, endDate, dimensionsList, metrics, dimensionFilterClauses, segmentId, segmentIdToAdd);
}

function buildReport(
  startDate: string,
  endDate: string,
  dimensionsList: DatamartUsersAnalyticsDimension[],
  metricsList: DatamartUsersAnalyticsMetric[],
  dimensionFilterClauses?: DimensionFilterClause,
  segmentId?: string,
  segmentIdToAggregate?: string,
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

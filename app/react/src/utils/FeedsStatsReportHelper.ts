import {
  ReportRequestBody,
  DateRange,
  Dimension,
  DimensionFilterClause,
  Metric,
  DimensionFilter,
} from '../models/ReportRequestBody';
import McsMoment from './McsMoment';

type FeedsStatsDimension =
  | 'ORGANISATION_ID'
  | 'DATAMART_ID'
  | 'AUDIENCE_SEGMENT_ID'
  | 'PLUGIN_VERSION_ID'
  | 'FEED_ID'
  | 'FEED_SESSION_ID'
  | 'SYNC_TYPE'
  | 'SYNC_RESULT'
  | 'TAG_KEY'
  | 'TAG_VALUE'
  | 'DAY'
  | 'HOUR';

type FeedsStatsMetric =
  | 'UNIQ_USER_POINTS_COUNT'
  | 'UNIQ_USER_IDENTIFIERS_COUNT'
  | 'UNIQ_TAG_KEYS'
  | 'UNIQ_TAG_VALUES';

  export interface FeedStatsDimensionFilter extends DimensionFilter {
    dimension_name: FeedsStatsDimension;
  }

export function buildFeedCardStatsRequestBody(
  segmentId: string,
): ReportRequestBody {
  const date7daysAgo: string = new McsMoment('now-7d').toMoment().format();
  const dimensionsList: FeedsStatsDimension[] = ['FEED_ID'];
  const metricsList: FeedsStatsMetric[] = ['UNIQ_USER_IDENTIFIERS_COUNT'];
  
  // DIMENSION FILTERS
  const dimensionFilter: FeedStatsDimensionFilter = {
    dimension_name: 'AUDIENCE_SEGMENT_ID',
    operator: 'EXACT',
    expressions: [segmentId],
  };
  const dimensionsFilterClauses: DimensionFilterClause = {
    operator: 'OR',
    filters: [dimensionFilter],
  };

  return buildReport(
    date7daysAgo,
    dimensionsList,
    dimensionsFilterClauses,
    metricsList
  );
}

export function buildFeedStatsByFeedRequestBody(
  feedId: string,
): ReportRequestBody {
  const date7daysAgo: string = new McsMoment('now-7d').toMoment().format();
  const dimensionsList: FeedsStatsDimension[] = ['FEED_ID', 'DAY', 'DAY', 'SYNC_TYPE'];
  const metricsList: FeedsStatsMetric[] = ['UNIQ_USER_IDENTIFIERS_COUNT'];
  
  // DIMENSION FILTERS
  const dimensionFilter: FeedStatsDimensionFilter = {
    dimension_name: 'FEED_ID',
    operator: 'EXACT',
    expressions: [feedId],
  };
  const dimensionsFilterClauses: DimensionFilterClause = {
    operator: 'OR',
    filters: [dimensionFilter],
  };

  return buildReport(
    date7daysAgo,
    dimensionsList,
    dimensionsFilterClauses,
    metricsList
  );
}

function buildReport(
  startDate: string,
  dimensionsList: FeedsStatsDimension[],
  dimensionFilterClauses: DimensionFilterClause,
  metricsList: FeedsStatsMetric[]
): ReportRequestBody {
  // DATE RANGE
  // const dateNow: string = new McsMoment('now').toMoment().format();

  const dateRange: DateRange = {
    start_date: "2019-09-01",
    end_date: "2019-09-10",
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

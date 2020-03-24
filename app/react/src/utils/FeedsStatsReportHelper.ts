import {
  ReportRequestBody,
  DateRange,
  Dimension,
  DimensionFilterClause,
  Metric,
  DimensionFilter,
} from '../models/ReportRequestBody';
import McsMoment, { formatMcsDate } from './McsMoment';
import { AudienceExternalFeedTyped, AudienceTagFeedTyped } from '../containers/Audience/Segments/Edit/domain';

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

export type FeedStatsUnit = "USER_POINTS" | "USER_IDENTIFIERS";

export interface FeedStatsCounts {
  exportedUserPointsCount?: number;
  exportedUserIdentifiersCount?: number;
}

export interface FeedStatsDimensionFilter extends DimensionFilter {
  dimension_name: FeedsStatsDimension;
}

export function buildFeedCardStatsRequestBody(
  segmentId: string,
): ReportRequestBody {
  const dimensionsList: FeedsStatsDimension[] = ['FEED_ID'];
  const metricsList: FeedsStatsMetric[] = ['UNIQ_USER_POINTS_COUNT', 'UNIQ_USER_IDENTIFIERS_COUNT'];

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

  const dateRange7daysAgo = formatMcsDate(
    {
      from: new McsMoment('now-7d'),
      to: new McsMoment('now'),
    },
    true,
  );

  return buildReport(
    {
      start_date: dateRange7daysAgo.from,
      end_date: dateRange7daysAgo.to,
    },
    dimensionsList,
    dimensionsFilterClauses,
    metricsList,
  );
}

export function buildFeedStatsByFeedRequestBody(
  feedId: string,
  dateRange: DateRange,
  metrics?: FeedsStatsMetric[]
): ReportRequestBody {
  const dimensionsList: FeedsStatsDimension[] = ['FEED_ID', 'DAY', 'SYNC_TYPE'];
  const metricsList: FeedsStatsMetric[] = metrics ? metrics : ['UNIQ_USER_POINTS_COUNT'];

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
    dateRange,
    dimensionsList,
    dimensionsFilterClauses,
    metricsList,
  );
}

function buildReport(
  dateRange: DateRange,
  dimensionsList: FeedsStatsDimension[],
  dimensionFilterClauses: DimensionFilterClause,
  metricsList: FeedsStatsMetric[],
): ReportRequestBody {
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

export function getFeedStatsUnit(feed: AudienceExternalFeedTyped | AudienceTagFeedTyped): FeedStatsUnit {

  // For Google and AppNexus external feeds, we display the count of identifiers
  if (feed.group_id === "com.mediarithmics.audience.externalfeed"
    && (feed.artifact_id === "google-ddp-connector"
      || feed.artifact_id === "appnexus-audience-segment-feed-direct"
      || feed.artifact_id === "appnexus-audience-segment-feed")) {
    return "USER_IDENTIFIERS";
  }

  // For TAG_FEED, we display the count of identifiers
  else if (feed.type === "TAG_FEED") {
    return "USER_IDENTIFIERS";
  }

  // Otherwise, we display the count of User Points
  else {
    return "USER_POINTS";
  }

}

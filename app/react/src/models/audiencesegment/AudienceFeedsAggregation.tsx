import { PaginatedApiParam } from '../../utils/ApiHelper';

export interface FeedAggregationRequest extends PaginatedApiParam {
  primary_dimension: FeedAggregationDimension;
  secondary_dimension: FeedAggregationDimension;
  metric: FeedAggregationMetric;
  organisation_id: string;
  order_by: FeedAggregationOrderBy;
}

export interface FeedAggregationOrderBy {
  sort_value: FeedAggregationSortValue;
  sort_order?: FeedAggregationSortOrder;
}

type FeedAggregationSortOrder = 'ASCENDING' | 'DESCENDING';
type FeedAggregationSortValue = 'PRIMARY_DIMENSION' | 'METRIC';

type FeedAggregationDimension = 'PLUGIN_VERSION_ID' | 'STATUS';
type FeedAggregationMetric = 'FEED_COUNT';

export interface FeedAggregationResponse {
  rows: FeedAggregationResponseRow[];
  secondary_dimension_metric_totals: FeedAggregationResponseMetricTotal[];
  first_result: number;
  total: number;
  count: number;
}

export interface FeedAggregationResponseRow {
  primary_dimension_value: FeedAggregationResponseDimensionValue;
  cells: FeedAggregationResponseCell[];
  metric_value_total: string;
}

export interface FeedAggregationResponseCell {
  secondary_dimension_value: FeedAggregationResponseDimensionValue;
  metric_value: string;
}

export interface FeedAggregationResponseMetricTotal {
  secondary_dimension_value: FeedAggregationResponseDimensionValue;
  metric_value_total: string;
}

export interface FeedAggregationResponseDimensionValue {
  value: string;
  display_label: string;
}

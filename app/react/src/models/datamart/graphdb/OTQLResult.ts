export interface OTQLResult {
  took: number | null;
  timed_out: boolean;
  offset: number | null;
  limit: number | null;
  result_type: OTQLResultType;
  precision: QueryPrecisionMode;
  rows: OTQLResultRowsShape;
  cache_hit: boolean;
}

export type QueryPrecisionMode = 'FULL_PRECISION' | 'LOWER_PRECISION' | 'MEDIUM_PRECISION';

export type OTQLResultType = 'COUNT' | 'SELECTION' | 'AGGREGATION';

export type OTQLResultRowsShape = OTQLAggregationResult[] | OTQLCountResult[] | OTQLDataResult[];

export interface OTQLBucket {
  key: string;
  count: number;
  aggregations: OTQLAggregations | null;
}

export interface OTQLMetric {
  name: string;
  fieldName: string;
  path: string | null;
  type: string;
  value: any;
}

export interface OTQLBuckets {
  name: string;
  field_name: string;
  path: string | null;
  type: string;
  buckets: OTQLBucket[];
}

export interface OTQLAggregations {
  buckets: OTQLBuckets[];
  metrics: OTQLMetric[];
}

export interface OTQLAggregationResult {
  aggregations: OTQLAggregations;
}

export interface OTQLCountResult {
  count: number;
}

export interface OTQLDataResult {
  [key: string]: any;
}

export function isAggregateResult(rows: OTQLResultRowsShape): rows is OTQLAggregationResult[] {
  return !!(rows.length && (rows as OTQLAggregationResult[])[0].aggregations !== undefined);
}

export function isCountResult(rows: OTQLResultRowsShape): rows is OTQLCountResult[] {
  return !!(rows.length && (rows as OTQLCountResult[])[0].count !== undefined);
}

export interface GraphQLResult {
  took: number;
  cache_hit: boolean;
  data: any;
}

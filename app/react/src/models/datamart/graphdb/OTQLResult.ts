import {
  AggregateDataset,
  CountDataset,
  JsonDataset,
} from '@mediarithmics-private/advanced-components/lib/models/dashboards/dataset/dataset_tree';
import {
  OTQLBuckets,
  OTQLMetric,
} from '@mediarithmics-private/advanced-components/lib/models/datamart/graphdb/OTQLResult';
import { QueryListModel, SerieQueryModel } from '../../../containers/QueryTool/OTQL/QueryToolTab';

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
  return !!(rows?.length && (rows as OTQLAggregationResult[])[0].aggregations !== undefined);
}

export function isAggregateDataset(
  aggregations: OTQLResult | AggregateDataset | CountDataset | OTQLAggregations,
): aggregations is AggregateDataset {
  return 'dataset' in aggregations;
}

export function isCountDataset(
  dataset: OTQLResult | AggregateDataset | CountDataset | OTQLAggregations,
): dataset is CountDataset {
  return 'value' in dataset;
}

export function isJsonDataset(
  dataset: OTQLResult | AggregateDataset | CountDataset | JsonDataset | OTQLAggregations,
): dataset is JsonDataset {
  return 'rows' in dataset;
}

export function isOTQLAggregations(
  aggregations: OTQLAggregations | AggregateDataset | CountDataset,
): aggregations is OTQLAggregations {
  return 'buckets' in aggregations;
}

export function isCountResult(rows: OTQLResultRowsShape): rows is OTQLCountResult[] {
  return !!(rows?.length && (rows as OTQLCountResult[])[0].count !== undefined);
}

function hasSubBuckets(rows: OTQLAggregationResult[]) {
  return !!rows[0].aggregations.buckets[0]?.buckets;
}

function hasMultipleSeries(rows: OTQLResultRowsShape) {
  return Object.keys(rows[0] || []).length > 2;
}

export function isOTQLResult(
  result: OTQLResult | AggregateDataset | CountDataset,
): result is OTQLResult {
  return !!(result as OTQLResult).result_type;
}

export function hasSubBucketsOrMultipleSeries(rows: OTQLResultRowsShape) {
  return (isAggregateResult(rows) && hasSubBuckets(rows)) || hasMultipleSeries(rows);
}

export interface GraphQLResult {
  took: number;
  cache_hit: boolean;
  data: any;
}

export function isQueryListModel(
  queryModel: string | QueryListModel[],
): queryModel is QueryListModel[] {
  return Array.isArray(queryModel);
}

export function isSerieQueryModel(
  model: SerieQueryModel | QueryListModel,
): model is SerieQueryModel {
  return (model as SerieQueryModel).queryModel !== undefined;
}

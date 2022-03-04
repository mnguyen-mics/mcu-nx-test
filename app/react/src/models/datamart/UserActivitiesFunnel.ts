import { DataResponse } from '@mediarithmics-private/mcs-components-library/lib/utils/ApiResponses';
import { DimensionFilterClause } from '../ReportRequestBody';

export interface FunnelFilter {
  id?: string;
  name: string;
  filter_clause: DimensionFilterClause;
  group_by_dimension?: string;
  group_by_dimensions?: string[];
  max_days_after_previous_step?: number;
}

export interface FunnelDateRange {
  type: string;
  start_date: string;
  end_date: string;
}

export interface FunnelWindowRange {
  type: string;
  unit: TimeUnit;
  offset: number;
}

export type FunnelTimeRange = FunnelDateRange;

export interface FunnelRequestBody {
  for: FunnelFilter[];
  in: FunnelTimeRange;
  number_of_parts_to_split_on: number;
  limit?: number;
}

export type FunnelResponse = DataResponse<GroupedByFunnel>;

export interface FunnelResource {
  total: number;
  steps: Step[];
}

export interface GroupedByFunnel {
  global: FunnelResource;
  grouped_by?: FieldValuesFunnelResource[];
}

export interface FieldValueFunnelResource {
  dimension_name: string;
  dimension_value: string;
  funnel: FunnelResource;
  dimension_decorator?: string;
}

export interface FieldValueFunnelMultipleDimensionResource {
  dimension_names: string[];
  dimension_values: string[];
  funnel: FunnelResource;
  dimension_decorator?: string;
}

export type FieldValuesFunnelResource =
  | FieldValueFunnelResource
  | FieldValueFunnelMultipleDimensionResource;

export function isFieldValueFunnelResource(
  f: FieldValuesFunnelResource,
): f is FieldValueFunnelResource {
  return (
    (f as FieldValueFunnelResource).dimension_name !== undefined &&
    (f as FieldValueFunnelResource).dimension_value !== undefined
  );
}

export function isFieldValueFunnelMultipleGroupByResource(
  f: FieldValuesFunnelResource,
): f is FieldValueFunnelMultipleDimensionResource {
  return (
    (f as FieldValueFunnelMultipleDimensionResource).dimension_names !== undefined &&
    (f as FieldValueFunnelMultipleDimensionResource).dimension_values !== undefined
  );
}

export interface Step {
  name: string;
  count: number;
  conversion?: number;
  amount?: number;
  interaction_duration: number;
}

export interface FunnelIdByDimension {
  name: string;
  id: string;
  colors: string[];
  decorator?: string;
}

export type TimeUnit = 'DAY' | 'WEEK' | 'MONTH';
export type TimeType = 'WINDOW' | 'DATES';

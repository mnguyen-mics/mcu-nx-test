import { DataResponse } from "@mediarithmics-private/mcs-components-library/lib/utils/ApiResponses";
import { DimensionFilterClause } from "../ReportRequestBody";

export interface FunnelFilter {
  name: string;
  filter_clause: DimensionFilterClause;
  group_by_dimension?: string;
}

export interface FunnelDateRange {
  type: string,
  start_date: string,
  end_date: string
}

export interface FunnelWindowRange {
  type: string,
  unit: TimeUnit,
  offset: number
}

export type FunnelTimeRange = FunnelDateRange


export interface FunnelRequestBody {
  for: FunnelFilter[];
  in: FunnelTimeRange;
  number_of_parts_to_split_on: number;
  limit?: number;
}

export type FunnelResponse = DataResponse<GroupedByFunnel>

export interface FunnelResource {
  total: number;
  steps: Steps[];
}

export interface GroupedByFunnel {
  global: FunnelResource; 
  grouped_by?: FieldValueFunnelResource[];
}
export interface FieldValueFunnelResource {
  dimension_name: string;
  dimension_value: string;
  funnel: FunnelResource;
}
export interface Steps {
  name: string;
  count: number;
  conversion?: number;
  amount?: number;
  interaction_duration: number;
  splitedView?: boolean;
  isLoading?: boolean
}

export interface FunnelIdByDimension {
  name: string,
  id: string,
  colors: string[]
}

export type TimeUnit = 'DAY' | 'WEEK' | 'MONTH';
export type TimeType = 'WINDOW' | 'DATES'
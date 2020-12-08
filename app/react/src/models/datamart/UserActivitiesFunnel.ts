import { DataResponse } from "@mediarithmics-private/mcs-components-library/lib/utils/ApiResponses";
import { DimensionFilterClause } from "../ReportRequestBody";

export interface FunnelFilter {
  name: string;
  filterClause: DimensionFilterClause;
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
}

export type FunnelResponse = DataResponse<FunnelResource>

export interface FunnelResource {
  total: number;
  steps: Steps[]
}

export interface Steps {
  name: string;
  count: number;
  interaction_duration: number
}

export type TimeUnit = 'DAY' | 'WEEK' | 'MONTH';
export type TimeType = 'WINDOW' | 'DATES'
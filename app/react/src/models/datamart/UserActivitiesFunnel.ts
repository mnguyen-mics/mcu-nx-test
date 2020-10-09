import { DataResponse } from "@mediarithmics-private/mcs-components-library/lib/utils/ApiResponses";
import { DimensionFilterClause } from "../ReportRequestBody";

export interface FunnelFilter {
  name: string;
  filterClause: DimensionFilterClause;
}

export interface FunnelTimeRange {
  type: TimeType;
  unit: TimeUnit; 
  offset: number;
}


export interface FunnelRequestBody {
  for: FunnelFilter[];
  in: FunnelTimeRange
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
export type TimeType = 'WINDOW' | 'DATE'
import { DimensionFilterClause } from "../ReportRequestBody";

export interface FunnelFilter {
  name: string, 
  filterClause: DimensionFilterClause;
}

export interface FunnelTimeRange {
  offset: number, 
  unit: TimeUnit
}

export interface FunnelRequestBody {
  for: FunnelFilter[],
  in: FunnelTimeRange
}

export interface FunnelResponse {
  total: number,
  steps: Steps[]
}

export interface Steps {
  name: string,
  count: number,
  interactionDuration: number
}

export type TimeUnit = 'DAY' | 'WEEK' | 'MONTH';

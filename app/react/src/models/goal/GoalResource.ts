export interface GoalCreateRequest {
  name: string;
  technical_name?: string;
  default_goal_value?: number;
  goal_value_currency?: string;
  datamart_id: string;
  new_query_id?: string;
  organisation_id?: string;
  archived: boolean;
  status: GoalStatus;
}

export type GoalStatus = 'PAUSED' | 'ACTIVE';

export type GoalTriggerType = 'QUERY' | 'PIXEL';

export interface GoalResource extends GoalCreateRequest {
  id: string;
}

export interface GoalTableResource extends GoalResource {
  conversions?: number;
  value?: number;
}

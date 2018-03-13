  
  export interface GoalCreateRequest {
    name: string;
    technical_name?: string;
    default_goal_value?: number;
    goal_value_currency?: string;
    new_query_id: string;
    organisation_id?: string;
    query_id?: string;
}

export interface GoalResource extends GoalCreateRequest {
  id: string;
  archived: boolean;
}

export interface UserQueryGoalResource extends GoalResource {
  new_query_id: string;
  type: 'USER_QUERY';
}

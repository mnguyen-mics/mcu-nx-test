export interface GoalCreateRequest {
  name: string;
  technical_name?: string;
}

export interface GoalResource extends GoalCreateRequest {
  id: string;
}
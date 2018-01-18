import { GoalSelectionType } from './GoalSelectionType';

export interface GoalSelectionCreateRequest {
  goal_id: string;
  goal_selection_type: GoalSelectionType;
  default: boolean;
}

export interface GoalSelectionResource extends GoalSelectionCreateRequest {
  id: string;
  goal_name: string;
}

import { GoalSelectionType } from './GoalSelectionType';

export interface GoalSelectionCreateRequest {
  goal_id: string;
}

export interface GoalSelectionResource extends GoalSelectionCreateRequest {
  id: string;
  goal_name: string;
  default: boolean;
  goal_selection_type: GoalSelectionType;
}

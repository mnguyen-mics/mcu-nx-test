import { GoalSelectionType } from './GoalSelectionType';

export interface GoalSelectionResource {
  id: string;
  goal_name: string;
  default: boolean;
  goal_selection_type: GoalSelectionType;
  goal_id: string;
}

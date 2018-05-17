import {
  GoalResource,
  GoalCreateRequest,
} from '../../../../models/goal';

export type GoalResourceShape = GoalResource | Partial<GoalCreateRequest>;

export interface LookbackWindow {
  postView: number;
  postClick: number;
}

export interface GoalFormData {
  goal: GoalResourceShape;
  lookbackWindow?: LookbackWindow;
}

export const INITIAL_GOAL_FORM_DATA: GoalFormData = {
  goal: {},
}

///////////////////////////
// PREDEFINED TYPE GUARD //
///////////////////////////
export function isGoalResource(
  goal: GoalResourceShape,
): goal is GoalResource {
  return (goal as GoalResource).id !== undefined;
}

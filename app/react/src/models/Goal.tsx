export interface GoalSelection {
    id: string;
    goal_id: string;
    goal_name: string;
    goal_selection_type: string;
}

export interface AttributionModel {
  'id': string;
  'default': true;
  'attribution_type': string;
  'attribution_model_id': string;
  'attribution_model_mode': string;
  'attribution_model_name': string;
  'group_id': string;
  'artifact_id': string;
}

import { FieldArrayModelWithMeta } from './../../../../utils/FormHelper';
import {
  AttributionSelectionResource,
  AttributionModelResource,
  AttributionModelCreateRequest,
  AttributionSelectionType,
} from './../../../../models/goal/AttributionSelectionResource';
import { GoalResource, GoalCreateRequest } from '../../../../models/goal';

export type GoalResourceShape = GoalResource | Partial<GoalCreateRequest>;

export interface LookbackWindow {
  postView: number;
  postClick: number;
}

export interface GoalFormData {
  goal: GoalResourceShape;
  lookbackWindow?: LookbackWindow;
}

export const INITIAL_GOAL_FORM_DATA: NewGoalFormData = {
  goal: {},
  attributionModels: [],
};

///////////////////////////
// PREDEFINED TYPE GUARD //
///////////////////////////
export function isGoalResource(goal: GoalResourceShape): goal is GoalResource {
  return (goal as GoalResource).id !== undefined;
}

export interface NewGoalFormData {
  goal: GoalResourceShape;
  attributionModels: AttributionModelListFieldModel[];
}

export interface AttributionModelMetaData {
  name :string;
  group_id: string;
  artefact_id: string;
  attribution_model_id?: string;
  attribution_model_type?: AttributionSelectionType; 
  default?: boolean;
}

export type AttributionModelFormData =
  | AttributionSelectionResource
  | AttributionModelResource
  | AttributionModelCreateRequest;

export type AttributionModelListFieldModel = FieldArrayModelWithMeta<
  AttributionModelFormData,
  AttributionModelMetaData
>;


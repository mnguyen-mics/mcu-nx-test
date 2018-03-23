import { QueryLanguage } from './../../../../models/datamart/DatamartResource';
import { FieldArrayModelWithMeta } from './../../../../utils/FormHelper';
import {
  AttributionSelectionResource,
  AttributionSelectionCreateRequest,
} from './../../../../models/goal/AttributionSelectionResource';
import { GoalResource, GoalCreateRequest } from '../../../../models/goal';
import { AttributionModelFormData } from '../../../Settings/CampaignSettings/AttributionModel/Edit/domain';

export type GoalResourceShape = GoalResource | Partial<GoalCreateRequest>;

export interface LookbackWindow {
  postView: number;
  postClick: number;
}

export const INITIAL_GOAL_FORM_DATA: GoalFormData = {
  goal: {},
  attributionModels: [],
  triggerMode: 'QUERY'
};

///////////////////////////
// PREDEFINED TYPE GUARD //
///////////////////////////
export function isGoalResource(goal: GoalResourceShape): goal is GoalResource {
  return (goal as GoalResource).id !== undefined;
}

export type TriggerMode = 'QUERY' | 'PIXEL';

export interface GoalFormData {
  goal: GoalResourceShape;
  attributionModels: AttributionModelListFieldModel[];
  queryContainer?: any;
  queryLanguage?: QueryLanguage;
  triggerMode: TriggerMode;
}

export interface AttributionModelMetaData {
  name?: string;
  group_id?: string;
  artifact_id?: string;
  default?: boolean;
}

export type AttributionModelShape =
  | AttributionSelectionResource
  | AttributionSelectionCreateRequest
  | AttributionModelFormData;

export type AttributionModelListFieldModel = FieldArrayModelWithMeta<
  AttributionModelShape,
  AttributionModelMetaData
>;

export function isAttributionSelectionResource(
  model: AttributionModelShape,
): model is AttributionSelectionResource {
  return (model as AttributionSelectionResource).id !== undefined;
}

export function isAttributionModelFormData(
  model: AttributionModelShape,
): model is AttributionModelFormData {
  return (model as AttributionModelFormData).plugin !== undefined;
}

export function isAttributionModelCreateRequest(
  model: AttributionModelShape,
): model is AttributionSelectionCreateRequest {
  return (
    (model as AttributionSelectionCreateRequest).attribution_model_id !==
      undefined && (model as AttributionSelectionResource).id === undefined
  );
}

export function isExistingGoal(
  model: GoalResourceShape
): model is GoalResource {
  return (model as GoalResource).id !== undefined;
}

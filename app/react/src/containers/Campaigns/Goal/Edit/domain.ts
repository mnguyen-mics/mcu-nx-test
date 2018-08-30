import {
  QueryLanguage,
  QueryResource,
} from './../../../../models/datamart/DatamartResource';
import { FieldArrayModelWithMeta } from './../../../../utils/FormHelper';
import {
  AttributionSelectionResource,
  AttributionSelectionCreateRequest,
} from './../../../../models/goal/AttributionSelectionResource';
import { GoalResource, GoalCreateRequest } from '../../../../models/goal';

export type GoalResourceShape = GoalResource | Partial<GoalCreateRequest>;

export interface LookbackWindow {
  postView: number;
  postClick: number;
}

export const INITIAL_GOAL_FORM_DATA: GoalFormData = {
  goal: {
    goal_value_currency: 'EUR',
    status: 'PAUSED'
  },
  attributionModels: [],
  triggerMode: 'QUERY',
  queryContainer: {},
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
  query?: QueryResource;
}

export interface AttributionModelMetaData {
  name?: string;
  group_id?: string;
  artifact_id?: string;
  default?: boolean;
}

export type AttributionModelShape =
  | AttributionSelectionResource
  | AttributionSelectionCreateRequest;

export type AttributionModelListFieldModel = FieldArrayModelWithMeta<
  AttributionModelShape,
  AttributionModelMetaData
>;

export function isAttributionSelectionResource(
  model: AttributionModelShape,
): model is AttributionSelectionResource {
  return (model as AttributionSelectionResource).id !== undefined;
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
  model: GoalResourceShape,
): model is GoalResource {
  return (model as GoalResource).id !== undefined;
}

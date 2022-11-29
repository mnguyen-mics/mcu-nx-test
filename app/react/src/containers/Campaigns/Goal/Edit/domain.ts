import {
  QueryResource,
  QueryLanguage,
  QueryCreateRequest,
} from './../../../../models/datamart/DatamartResource';
import { FieldArrayModelWithMeta } from './../../../../utils/FormHelper';
import {
  AttributionSelectionResource,
  AttributionSelectionCreateRequest,
} from './../../../../models/goal/AttributionSelectionResource';
import { GoalResource, GoalCreateRequest } from '../../../../models/goal';
import { GoalTriggerType } from '../../../../models/goal/GoalResource';

export type GoalResourceShape = GoalResource | GoalCreateRequest;
export type QueryResourceShape = QueryResource | QueryCreateRequest;
export interface LookbackWindow {
  postView: number;
  postClick: number;
}

export const INITIAL_GOAL_FORM_DATA: GoalFormData = {
  goal: {
    goal_value_currency: 'EUR',
    status: 'PAUSED',
    name: '',
    datamart_id: '',
    archived: false,
  },
  attributionModels: [],
  triggerType: 'QUERY',
  queryLanguage: 'JSON_OTQL',
  query: {
    datamart_id: '',
    query_language: 'JSON_OTQL',
    query_text: '',
  },
};

///////////////////////////
// PREDEFINED TYPE GUARD //
///////////////////////////
export function isGoalResource(goal: GoalResourceShape): goal is GoalResource {
  return (goal as GoalResource).id !== undefined;
}

export interface GoalFormData {
  goal: GoalResourceShape;
  attributionModels: AttributionModelListFieldModel[];
  queryContainer?: any;
  triggerType: GoalTriggerType;
  query: QueryResourceShape;
  queryLanguage: QueryLanguage;
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
    (model as AttributionSelectionCreateRequest).attribution_model_id !== undefined &&
    (model as AttributionSelectionResource).id === undefined
  );
}

export function isExistingGoal(model: GoalResourceShape): model is GoalResource {
  return (model as GoalResource).id !== undefined;
}

import { StrictlyLayoutablePlugin } from './../Plugins';
import { FeedNodeFormData } from './../../containers/Automations/Builder/AutomationNode/Edit/domain';
import {
  ABNFormData,
  EmailCampaignAutomationFormData,
  WaitFormData,
  AddToSegmentAutomationFormData,
  DeleteFromSegmentAutomationFormData,
  OnSegmentEntryInputAutomationFormData,
  OnSegmentExitInputAutomationFormData,
  QueryInputAutomationFormData,
  CustomActionAutomationFormData,
} from '../../containers/Automations/Builder/AutomationNode/Edit/domain';

import {
  QueryResource,
  QueryCreateRequest,
} from './../datamart/DatamartResource';
import { AutomationSimpleFormData } from './../../containers/Automations/Builder/ActionBar/AutomationSimpleForm';
import { WeekDay } from '../../utils/DateHelper';
export interface AutomationResource {
  id: string;
  name: string;
  datamart_id: string;
  organisation_id: string;
  status: AutomationStatus;
}

export function isAutomationResource(
  automation: AutomationSimpleFormData,
): automation is AutomationResource {
  return (automation as AutomationResource).id !== undefined;
}

export type AutomationStatus = 'NEW' | 'ACTIVE' | 'PAUSED';
export const automationStatuses: AutomationStatus[] = [
  'NEW',
  'ACTIVE',
  'PAUSED',
];

export interface AutomationCreateResource {
  name: string;
  datamart_id: string;
}

export interface StorylineResource {
  begin_node_id: string;
}

export type ScenarioNodeType =
  | 'EMAIL_CAMPAIGN'
  | 'ADD_TO_SEGMENT_NODE'
  | 'DELETE_FROM_SEGMENT_NODE'
  | 'QUERY_INPUT'
  | 'ON_SEGMENT_ENTRY_INPUT_NODE'
  | 'ON_SEGMENT_EXIT_INPUT_NODE'
  | 'ABN_NODE'
  | 'PLUGIN_NODE'
  | 'END_NODE'
  | 'WAIT_NODE'
  | 'DROP_NODE'
  | 'IF_NODE'
  | 'CUSTOM_ACTION_NODE'
  | 'SCENARIO_AUDIENCE_SEGMENT_FEED_NODE';

export interface ScenarioNodeResource {
  id: string;
  scenario_id: string;
  type: ScenarioNodeType;
  last_added_node?: boolean;
}

export interface EmailCampaignNodeResource extends ScenarioNodeResource {
  type: 'EMAIL_CAMPAIGN';
  campaign_id: string;
  formData: EmailCampaignAutomationFormData;
  initialFormData: EmailCampaignAutomationFormData;
}

export interface AddToSegmentNodeResource extends ScenarioNodeResource {
  type: 'ADD_TO_SEGMENT_NODE';
  user_list_segment_id: string;
  user_segment_expiration_period: string;
  formData: AddToSegmentAutomationFormData;
  initialFormData: AddToSegmentAutomationFormData;
}

export interface DeleteFromSegmentNodeResource extends ScenarioNodeResource {
  type: 'DELETE_FROM_SEGMENT_NODE';
  user_list_segment_id: string;
  formData: DeleteFromSegmentAutomationFormData;
  initialFormData: DeleteFromSegmentAutomationFormData;
}

export type QueryInputEvaluationPeriodUnit =
  | 'MINUTE'
  | 'HOUR'
  | 'DAY'
  | 'WEEK'
  | 'MONTH';

export type QueryInputEvaluationMode = 'LIVE' | 'PERIODIC';

export type QueryInputUiCreationMode =
  | 'QUERY'
  | 'REACT_TO_EVENT_STANDARD'
  | 'REACT_TO_EVENT_ADVANCED';

export interface QueryInputNodeResource extends ScenarioNodeResource {
  type: 'QUERY_INPUT';
  formData: QueryInputAutomationFormData;
  query_id: string;
  evaluation_mode?: QueryInputEvaluationMode;
  evaluation_period?: number;
  evaluation_period_unit?: QueryInputEvaluationPeriodUnit;
  ui_creation_mode: QueryInputUiCreationMode;
}

export interface OnSegmentEntryInputNodeResource extends ScenarioNodeResource {
  type: 'ON_SEGMENT_ENTRY_INPUT_NODE';
  audience_segment_id: string;
  formData: OnSegmentEntryInputAutomationFormData;
  initialFormData: OnSegmentEntryInputAutomationFormData;
}

export interface OnSegmentExitInputNodeResource extends ScenarioNodeResource {
  type: 'ON_SEGMENT_EXIT_INPUT_NODE';
  audience_segment_id: string;
  formData: OnSegmentExitInputAutomationFormData;
  initialFormData: OnSegmentExitInputAutomationFormData;
}

export type InputNodeResource = QueryInputNodeResource | OnSegmentEntryInputNodeResource | OnSegmentExitInputNodeResource;

export type EdgeSelection = { [edgeId: string]: { min: number; max: number } };

export interface ABNNodeResource extends ScenarioNodeResource {
  type: 'ABN_NODE';
  edges_selection: EdgeSelection;
  formData?: ABNFormData;
  branch_number?: number;
}

export interface PluginNodeResource extends ScenarioNodeResource {
  type: 'PLUGIN_NODE';
  artifact_id: string;
  group_id: string;
  id: string;
  scenario_id: string;
  scenario_node_processor_id: string;
}

export interface EndNodeResource extends ScenarioNodeResource {
  type: 'END_NODE';
}

export interface WaitNodeResource extends ScenarioNodeResource {
  type: 'WAIT_NODE';
  delay_period: string;
  day_window?: WeekDay[];
  time_window_start?: string;
  time_window_end?: string;
  formData: WaitFormData;
}

export interface IfNodeResource extends ScenarioNodeResource {
  type: 'IF_NODE';
  formData: Partial<QueryResource>;
  query_id: string;
}

export interface CustomActionNodeResource extends ScenarioNodeResource {
  type: 'CUSTOM_ACTION_NODE';
  custom_action_id?: string;
  formData?: CustomActionAutomationFormData;
}

export interface FeedNodeResource extends ScenarioNodeResource {
  type: 'SCENARIO_AUDIENCE_SEGMENT_FEED_NODE';
  feed_id?: string;
  formData?: FeedNodeFormData;
  strictlyLayoutablePlugin?: StrictlyLayoutablePlugin;
}

export type ScenarioNodeShape =
  | EmailCampaignNodeResource
  | AddToSegmentNodeResource
  | DeleteFromSegmentNodeResource
  | QueryInputNodeResource
  | OnSegmentEntryInputNodeResource
  | OnSegmentExitInputNodeResource
  | ABNNodeResource
  | PluginNodeResource
  | EndNodeResource
  | WaitNodeResource
  | IfNodeResource
  | CustomActionNodeResource
  | FeedNodeResource;

export interface ScenarioEdgeResource {
  id: string;
  source_id: string;
  target_id: string;
  handler: EdgeHandler;
  scenario_id: string;
}

export type EdgeHandler =
  | 'ON_VISIT'
  | 'ON_GOAL'
  | 'OUT'
  | 'IF_CONDITION_TRUE'
  | 'IF_CONDITION_FALSE';

export interface StorylineNodeResource {
  node: ScenarioNodeShape;
  in_edge?: ScenarioEdgeResource;
  out_edges: StorylineNodeResource[];
}

export interface ScenarioExitConditionCreateResource {
  type: 'EVENT';
  query_id: string;
}

export interface ScenarioExitConditionResource
  extends ScenarioExitConditionCreateResource {
  id: string;
  scenario_id: string;
}

export interface ScenarioExitConditionFormData
  extends Partial<QueryCreateRequest> {}

export interface ScenarioExitConditionFormResource
  extends ScenarioExitConditionResource {
  formData: ScenarioExitConditionFormData;
  initialFormData: ScenarioExitConditionFormData;
}

export interface UserScenarioResource {
  datamart_id: string;
  user_point_id: string;
  scenario_id: string;
  execution_id?: string;
  node_id: string;
  active?: boolean;
  callback_ts?: string;
  start_ts?: string;
  node_start_ts?: string;
  matched_exit_condition_id?: string;
}

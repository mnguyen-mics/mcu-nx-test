import {
  DisplayCampaignAutomationFormData,
  ABNFormData,
  EmailCampaignAutomationFormData,
  WaitFormData,
  AddToSegmentAutomationFormData,
  DeleteFromSegmentAutomationFormData,
} from '../../containers/Automations/Builder/AutomationNode/Edit/domain';

import { QueryResource } from './../datamart/DatamartResource';
import { AutomationSimpleFormData } from './../../containers/Automations/Builder/ActionBar/AutomationSimpleForm';
export interface AutomationResource {
  id: string;
  name: string;
  datamart_id: string;
  organisation_id: string;
  status: AutomationStatus;
  technical_name?: string;
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
  technical_name?: string;
}

export interface StorylineResource {
  begin_node_id: string;
}

export type ScenarioNodeType =
  | 'DISPLAY_CAMPAIGN'
  | 'EMAIL_CAMPAIGN'
  | 'ADD_TO_SEGMENT_NODE'
  | 'DELETE_FROM_SEGMENT_NODE'
  | 'QUERY_INPUT'
  | 'ABN_NODE'
  | 'PLUGIN_NODE'
  | 'END_NODE'
  | 'WAIT_NODE'
  | 'DROP_NODE'
  | 'IF_NODE';

export interface ScenarioNodeResource {
  id: string;
  name: string;
  scenario_id: string;
  x?: number;
  y?: number;
  type: ScenarioNodeType;
  last_added_node?: boolean;
}

export interface DisplayCampaignNodeResource extends ScenarioNodeResource {
  type: 'DISPLAY_CAMPAIGN';
  campaign_id: string;
  ad_group_id: string;
  formData: DisplayCampaignAutomationFormData;
  initialFormData: DisplayCampaignAutomationFormData;
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

export type QueryInputEvaluationPeriodUnit = 'MINUTE' | 'HOUR' | 'DAY' | 'WEEK' | 'MONTH';

export type QueryInputEvaluationMode = 'LIVE' | 'PERIODIC';

export interface QueryInputNodeResource extends ScenarioNodeResource {
  type: 'QUERY_INPUT';
  formData: Partial<QueryResource>;
  query_id: string;
  evaluation_mode?: QueryInputEvaluationMode;
  evaluation_period?: number;
  evaluation_period_unit?: QueryInputEvaluationPeriodUnit;
  creation_mode: 'QUERY' | 'REACT_TO_EVENT';
}

export interface ABNNodeResource extends ScenarioNodeResource {
  type: 'ABN_NODE';
  edges_selection: { [nodeId: string]: { min: number; max: number } };
  formData?: ABNFormData;
  branch_number?: number;
}

export interface PluginNodeResource extends ScenarioNodeResource {
  type: 'PLUGIN_NODE';
  artifact_id: string;
  group_id: string;
  id: string;
  name: string;
  scenario_id: string;
  scenario_node_processor_id: string;
}

export interface EndNodeResource extends ScenarioNodeResource {
  type: 'END_NODE';
}

export interface WaitNodeResource extends ScenarioNodeResource {
  type: 'WAIT_NODE';
  delay_period: string;
  formData: WaitFormData;
}

export interface IfNodeResource extends ScenarioNodeResource {
  type: 'IF_NODE';
  formData: Partial<QueryResource>;
  query_id: string;
}

export type ScenarioNodeShape =
  | DisplayCampaignNodeResource
  | EmailCampaignNodeResource
  | AddToSegmentNodeResource
  | DeleteFromSegmentNodeResource
  | QueryInputNodeResource
  | ABNNodeResource
  | PluginNodeResource
  | EndNodeResource
  | WaitNodeResource
  | IfNodeResource;

export interface ScenarioEdgeResource {
  id: string;
  source_id: string;
  target_id: string;
  handler: EdgeHandler;
  scenario_id: string;
}

export type EdgeHandler = 'ON_VISIT' | 'ON_GOAL' | 'OUT' | 'IF_CONDITION_TRUE' | 'IF_CONDITION_FALSE';

export interface StorylineNodeResource {
  node: ScenarioNodeShape;
  in_edge?: ScenarioEdgeResource;
  out_edges: StorylineNodeResource[];
}

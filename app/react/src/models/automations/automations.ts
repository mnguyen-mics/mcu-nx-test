export interface AutomationResource {
<<<<<<< 6fba27ed4671207f387c98c9c385c585077ac81e
    id: string;
    name: string;
    datamart_id: string;
    organisation_id: string;
    status: AutomationStatus;
=======
  id: string;
  name: string;
  datamart_id: string;
  organisation_id: string;
  status: 'ACTIVE' | 'PENDING' | 'NEW';
>>>>>>> making files prettier
}

export type AutomationStatus = 'NEW' | 'ACTIVE' | 'PAUSED';
export const automationStatuses: AutomationStatus[] = ['NEW', 'ACTIVE', 'PAUSED'];


export interface AutomationCreateResource {
  name: string;
  datamart_id: string;
}

export interface StorylineResource {
  begin_node_id: string;
}

export interface ScenarioNodeResource {
  id: string;
  name: string | null;
  scenario_id: string;
}

export interface DisplayCampaignNodeResource extends ScenarioNodeResource {
  type: 'DISPLAY_CAMPAIGN';
  campaign_id: string;
  ad_group_id: string;
}

export interface EmailCampaignNodeResource extends ScenarioNodeResource {
  type: 'EMAIL_CAMPAIGN';
  campaign_id: string;
}

export interface QueryInputNodeResource extends ScenarioNodeResource {
  type: 'QUERY_INPUT';
  query_id: string;
  evaluation_mode: string;
  evaluation_period: string | null;
  evaluation_period_unit: string | null;
}

export interface ABNNodeResource extends ScenarioNodeResource {
  type: 'ABN_NODE';
  edges_selection: { [nodeId: string]: { min: number; max: number } };
}

export interface PluginNodeResource extends ScenarioNodeResource {
  type: 'PLUGIN_NODE';
  artifact_id: string;
  group_id: string;
  id: string;
  name: string | null;
  scenario_id: string;
  scenario_node_processor_id: string;
}

export type ScenarioNodeShape =
  | DisplayCampaignNodeResource
  | EmailCampaignNodeResource
  | QueryInputNodeResource
  | ABNNodeResource
  | PluginNodeResource;

export interface ScenarioEdgeResource {
  id: string;
  source_id: string;
  target_id: string;
  handler: EdgeHandler;
  scenario_id: string;
}

export enum EdgeHandler {
  'ON_VISIT',
  'ON_GOAL',
  'GOAL',
}

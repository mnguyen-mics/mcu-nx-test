export interface PluginInterface {
  id: string;
  organisation_id: string;
  plugin_type: string;
  group_id: string;
  artifact_id: string;
  current_version_id: string;
}

export interface PluginProperty {
  deletable: boolean;
  origin: string;
  property_type: string;
  technical_name: string;
  value: any;
  writable: boolean;
}

export interface AttributionModel {
  artifact_id: string;
  attribution_processor_id: string;
  group_id: string;
  id: string;
  mode: string;
  name: string;
  organisation_id: string;
}

export interface BidOptimizer {
  engine_artifact_id: string;
  engine_group_id: string;
  engine_version_id: string;
  id: string;
  name: string;
  organisation_id: string;
  properties?: PluginProperty[];
}

export interface BidOptimizer {
  engine_artifact_id: string;
  engine_group_id: string;
  engine_version_id: string;
  id: string;
  name: string;
  organisation_id: string;
  properties?: PluginProperty[];
}
export interface EmailRouter {
  id: string;
  name: string;
  organisation_id: string;
  group_id: string;
  artifact_id: string;
  version_value: string;
  version_id: string;
}

export interface VisitAnalyzer {
  id: string;
  artifact_id: string;
  name: string;
  group_id: string;
  version_id: string;
  version_value: string;
  visit_analyzer_plugin_id: string;
  organisation_id: string;
  properties?: PluginProperty[];
}

export interface Recommender {
  id: string;
  artifact_id: string;
  name: string;
  group_id: string;
  version_id: string;
  version_value: string;
  recommenders_plugin_id: string;
  organisation_id: string;
  properties?: PluginProperty[];
}

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

export type PluginType = 'ACTIVITY_ANALYZER' |
'RECOMMENDER' |
'ACTIVITY_ANALYZER' |
'BID_OPTIMIZATION_ENGINE' |
'ATTRIBUTION_PROCESSOR' |
'EMAIL_ROUTER' |
'AUDIENCE_SEGMENT_EXTERNAL_FEED' |
'AUDIENCE_SEGMENT_TAG_FEED';

export interface PluginVersion {
  id: string;
  plugin_id: string;
  organisation_id: string;
  plugin_type: PluginType;
  group_id: string;
  artifact_id: string;
  version_id: string;
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
}

export interface BidOptimizer {
  engine_artifact_id: string;
  engine_group_id: string;
  engine_version_id: string;
  id: string;
  name: string;
  organisation_id: string;
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
}

export type Status = "INITAL" | "PAUSED" | "ACTIVE";
export interface AudienceExternalFeed {
  artifact_id: string;
  audience_segment_id: string;
  group_id: string;
  id: string;
  organisation_id: string;
  status: Status;
  version_id: string;
}

export interface AudienceTagFeed {
  artifact_id: string;
  audience_segment_id: string;
  group_id: string;
  id: string;
  status: Status;
}
export interface PluginResource {
  id: string;
  organisation_id: string;
  plugin_type?: PluginType;
  group_id: string;
  artifact_id: string;
  current_version_id: string;
  plugin_id?: string
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

export interface PluginVersionResource {
  id: string;
  plugin_id: string;
  organisation_id: string;
  plugin_type: PluginType;
  group_id: string;
  artifact_id: string;
  version_id: string;
  max_qps: number;
  archived: boolean;
}

export interface AttributionModelCreateRequest {
  artifact_id: string;
  group_id: string;
  mode?: 'STRICT' | 'DISCOVERY';
  name: string;
}

export interface AttributionModel extends AttributionModelCreateRequest {
  attribution_processor_id: string;
  id: string;
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

export type Status = "INITIAL" | "PAUSED" | "ACTIVE" | "PUBLISHED";
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
  organisation_id: string;
}

export interface Adlayout {
  id: string;
  name: string;
  optimal_formats: string;
  organisation_id: string;
  renderer_id: string;
  render_version_id: string;
}

export interface StylesheetVersionResource {
  artifact_id: string;
  creation_date: number;
  description: string;
  group_id: string;
  id: string;
  organisation_id: string;
  plugin_version_id: string;
  status: string;
  style_sheet_id: string;
  version_id: string;
}

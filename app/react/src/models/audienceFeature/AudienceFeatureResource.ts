export type AudienceFeatureType =
  | 'Int'
  | 'Float'
  | 'Enum'
  | 'Boolean'
  | 'String'
  | 'ID'
  | 'Date'
  | 'Timestamp'
  | AdditionalAudienceFeatureType
  | null;

type AdditionalAudienceFeatureType =
  | 'OperatingSystemFamily'
  | 'FormFactor'
  | 'HashFunction'
  | 'BrowserFamily'
  | 'UserAgentType'
  | 'ActivitySource'
  | 'UserActivityType';

export interface AudienceFeatureVariableResource {
  field_name: string;
  parameter_name: string;
  path: string[];
  type: AudienceFeatureType;
  values?: string[];
  data_type?: string;
  reference_type?: string;
  container_type?: string;
  reference_model_type?: string;
}

export interface AudienceFeatureResource {
  id: string;
  name: string;
  datamart_id: string;
  description: string;
  token: string;
  addressable_object: string;
  object_tree_expression: string;
  variables?: AudienceFeatureVariableResource[];
  folder_id?: string | null;
}

export interface AudienceFeatureFolderResource {
  id: string;
  name: string;
  datamart_id: string;
  audience_features_ids?: string[];
  parent_id?: string | null;
  children_ids?: string[];
}

export interface AudienceFeatureSegmentsMappingResource {
  audience_feature_id: string;
  segments_ids: string[];
}

export interface AudienceFeatureSearchResponseResource {
  data: AudienceFeaturePagedResultResource;
  infos: AudienceFeatureSearchContextInfoResource[];
}

export interface AudienceFeaturePagedResultResource {
  elements: AudienceFeatureResource[];
  limit?: number;
  offset?: number;
  total_results?: number;
}

export interface AudienceFeatureSearchContextInfoResource {
  info_name: string;
  info_value: string;
}

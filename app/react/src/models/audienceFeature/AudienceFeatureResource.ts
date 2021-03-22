export type AudienceFeatureType =
  | 'Int'
  | 'Float'
  | 'Enum'
  | 'Boolean'
  | 'String'
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
  variables: AudienceFeatureVariableResource[];
  folder_id: string;
}

export interface AudienceFeatureFolderResource {
  id: string | null;
  name: string;
  datamart_id: string;
  audience_features_ids: string[] | null;
  parent_id: string | null;
  children_ids: string[] | null;
}

export interface AudienceFeaturesByFolder {
  id: string | null;
  name: string;
  audience_features: AudienceFeatureResource[];
  parent_id: string | null;
  children: AudienceFeaturesByFolder[];
}

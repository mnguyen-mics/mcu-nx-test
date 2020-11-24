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
  reference_type?: string;
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
}

export interface MlFunctionResource {
  id: string;
  organisation_id: string;
  datamart_id: string;
  status: MlFunctionStatus;
  name: string;
  hosting_object_type_name: string;
  field_name: string;
  field_type_name: string;
  query: string;
  group_id: string;
  artifact_id: string;
  version_id: string;
  version_value: string;
  expiration_period: string;
}

export type MlFunctionStatus = 'INITIAL' | 'ACTIVE' | 'PAUSED' | 'ERROR';

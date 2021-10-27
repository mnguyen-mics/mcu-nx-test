import { BaseExecutionResource } from '../Job';

export type DocumentType =
  | 'USER_ACTIVITY'
  | 'USER_PROFILE'
  | 'USER_SEGMENT'
  | 'USER_IDENTIFIERS_ASSOCIATION_DECLARATIONS'
  | 'USER_IDENTIFIERS_DISSOCIATION_DECLARATIONS'
  | 'USER_IDENTIFIERS_DELETION';
export interface Import {
  datamart_id: string;
  id: string;
  name: string;
  datafarm_key: string;
  encoding: string;
  mime_type: 'APPLICATION_X_NDJSON' | 'TEXT_CSV';
  document_type: DocumentType;

  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export type ImportExecution = BaseExecutionResource<
  ImportExecutionParameters,
  ImportExecutionResult
>;

export interface ImportExecutionResult {
  error_file_uri: string;
  input_file_uri: string;
  input_file_name: string;
  total_failure: number;
  total_success: number;
}

export interface ImportExecutionParameters {
  datamart_id: number;
  document_import_id: number;
  document_type: DocumentType;
  file_uri: string;
  total_failure: number;
  total_success: number;
}
export interface MakeJobExecutionAction {
  action: 'CANCEL';
}

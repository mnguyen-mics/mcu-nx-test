export type DocumentType = 
  'USER_ACTIVITY' |
  'USER_PROFILE' |
  'USER_SEGMENT' |
  'USER_IDENTIFIERS_ASSOCIATION_DECLARATIONS' |
  'USER_IDENTIFIERS_DISSOCIATION_DECLARATIONS' |
  'USER_IDENTIFIERS_DELETION';
export interface Import {
  datamart_id: string;
  id: string;
  name: string;
  datafarm_key: string;
  encoding: string;
  mime_type: "APPLICATION_X_NDJSON" | "TEXT_CSV";
  document_type: DocumentType;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

export interface ImportExecution {
  completed_tasks: null | string;
  creation_date: number;
  debug: null | string;
  duration: number;
  error: null | { message: string };
  id: string;
  job_type: string;
  import_mode: string;
  import_type: string;
  num_tasks: null | string;
  organisation_id: string;
  parameters: ExecutionParameters | null;
  result: ExecutionResult | null;
  start_date: number;
  status: 'SUCCESS' | 'RUNNING' | 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED';
  user_id: string;
}

export interface ExecutionResult {
    error_file_uri: string;
    input_file_uri: string;
    input_file_name: string;
    total_failure: number;
    total_success: number;
  };

export interface ExecutionParameters {
  datamart_id: number;
  document_import_id: number;
  document_type: DocumentType;
  file_uri: string;
  total_failure: number;
  total_success: number;
}
export interface MakeJobExecutionAction {
  action: 'CANCEL'
}

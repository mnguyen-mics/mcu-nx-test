export interface Import {
  datamart_id: string;
  id: string;
  name: string;
  datafarm_key: string;
  encoding: string;
  mime_type: "APPLICATION_X_NDJSON" | "TEXT_CSV";
  document_type: string; // 'USER_ACTIVITY' | 'USER_PROFILE' | 'USER_SEGMENT';
}

export type ImportExecution = ImportExecutionSuccess | ImportExecutionBase;

export interface ImportExecutionBase {
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
  parameters: object;
  start_date: number;
  status: 'SUCCESS' | 'RUNNING' | 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED';
  user_id: string;
}

export interface ImportExecutionSuccess extends ImportExecutionBase {
  status: 'SUCCESS' | 'SUCCEEDED',
  result: { 
    output_files: string[];
    total_failure: number;
    total_success: number;
  };
}
export interface MakeJobExecutionAction {
  action: 'CANCEL'
}

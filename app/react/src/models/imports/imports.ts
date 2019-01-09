export interface Import {
  datamart_id: string;
  id: string;
  name: string;
  datafarm_key: string;
  encoding: string;
  mime_type: string;
  document_type: string; // 'USER_ACTIVITY' | 'USER_PROFILE' | 'USER_SEGMENT';
}

export interface ImportCreateResource {
  name: string;
  encoding: string;
  mime_type: string;
}

export interface ImportExecution {
  completed_tasks: null | string;
  creation_date: number;
  debug: null | string;
  duration: number;
  error: null | string;
  id: string;
  job_type: string;
  num_tasks: null | string;
  organisation_id: string;
  parameters: object;
  result: { output_files: string[] };
  start_date: number;
  status: string;
  user_id: string;
}

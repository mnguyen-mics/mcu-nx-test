export interface Export {
  datamart_id: string;
  id: string;
  name: string;
  organisation_id: string;
  output_format: string;
  query_id: string;
  type: string;
}

export interface ExportCreateResource {
  name: string;
  output_format: 'CSV' | 'JSON';
  query_id: string;
  type: 'QUERY';
}
export interface ExportExecution {
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

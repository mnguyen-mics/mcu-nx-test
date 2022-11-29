export interface PublicJobExecutionResource {
  id: string;
  status: JobExecutionStatus;
  creation_date: number;
  start_date?: number;
  duration?: number;
  organisation_id?: string;
  user_id?: string;
  debug?: string;
  num_tasks?: number;
  completed_tasks?: number;
  erroneous_tasks?: number;
  external_model_name: ExternalModelName;
}

export interface BaseExecutionResource<I, R> extends PublicJobExecutionResource {
  parameters?: I;
  result?: R;
  error?: {
    message: string;
  };
}

export type ExternalModelName =
  | 'PUBLIC_EXPORT'
  | 'PUBLIC_CATALOG'
  | 'PUBLIC_DATAMART'
  | 'PUBLIC_AUDIENCE_SEGMENT';

export type JobExecutionStatus =
  | 'WAITING_DEPENDENT_JOB'
  | 'SCHEDULED'
  | 'PENDING'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'EXECUTOR_NOT_RESPONDING'
  | 'LOST'
  | 'SUCCESS'
  | 'CANCELED';

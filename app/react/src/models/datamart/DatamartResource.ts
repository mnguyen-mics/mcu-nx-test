export interface DatamartResource {
  id: string;
  name: string;
  organisation_id: string;
  token: string;
  creation_date: number;
  time_zone: string;
  type: DatamartType;
  datafarm: string;
  region: string;
  storage_model_version: string;
}

type DatamartType = 'DATAMART' | 'CROSS_DATAMART';

export type QueryLanguage = 'SELECTORQL' | 'OTQL' | 'JSON_OTQL';
export interface QueryResource {
  id: string;
  datamart_id: string;
  major_version?: string;
  minor_version?: string;
  query_language: QueryLanguage;
  query_text?: string;
}
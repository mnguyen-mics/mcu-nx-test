export interface DatamartResource {
  id: string;
  name: string;
  organisation_id: string;
  token: string;
  creation_date: Date;
  time_zone: string; // DateTimeZone ?
  type: DatamartType;
  datafarm: string;
}

type DatamartType = 'DATAMART' | 'CROSS_DATAMART';

export type QueryLanguage = 'SELECTORQL' | 'OTQL';
export interface QueryResource {
  id: string;
  datamart_id: string;
  major_version?: string;
  minor_version?: string;
  query_language: QueryLanguage;
  query_text?: string;
}
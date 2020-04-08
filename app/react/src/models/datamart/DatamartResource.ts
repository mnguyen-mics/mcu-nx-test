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
  archived: boolean;
}

export interface DatamartWithMetricResource extends DatamartResource{
audience_segment_metrics: AudienceSegmentMetricResource[] 
}

export type DatamartType = 'DATAMART' | 'CROSS_DATAMART';

export type QueryLanguage = 'SELECTORQL' | 'OTQL' | 'JSON_OTQL';

export interface QueryCreateRequest {
  datamart_id: string;
  major_version?: string;
  minor_version?: string;
  query_language: QueryLanguage;
  query_text: string;
}

export interface QueryResource extends QueryCreateRequest {
  id: string;
}

export interface UserAccountCompartmentResource {
  id: string;
  organisation_id: string;
  token: string;
  name: string;
  archived: boolean;
}

export interface UserAccountCompartmentDatamartSelectionResource {
  id: string;
  datamart_id: string;
  compartment_id: string;
  default: boolean;
  token: string;
  name: string;
}

export interface AutoCompleteResource {
  type: string;
  object_type_name: string;
  field_name: string;
}

export type ErrorQueryResource = ValidationErrorResource | ParsingErrorResource | ValidResource;

export interface ErrorResource {
  type: "PARSING_ERROR" | "VALID" | "VALIDATION_ERROR"
}

export interface ParsingErrorResource extends ErrorResource {
  type: "PARSING_ERROR";
  error: ErroTypeResource;
  status: "error";
}

export interface ValidResource extends ErrorResource {
  type: "VALID";
  status: "ok";
}

export interface ValidationErrorResource extends ErrorResource {
  type: "VALIDATION_ERROR";
  error: ErroTypeResource;
  status: "error";
}

export interface ErroTypeResource {
  message: string;
  position: {
    row: number;
    col: number;
  }
  error_type: "PARSING" | "TYPINGS" | "FIELD" | "DIRECTIVE";
}

export interface AudienceSegmentMetricResource {
  id: string;
  datafarmKey: string;
  datamartId: string;
  queryId: string;
  technical_name:
    | 'user_accounts'
    | 'emails'
    | 'desktop_cookie_ids'
    | 'mobile_ad_ids'
    | 'mobile_cookie_ids';
  display_name: string;
  icon: string;
  status: 'DRAFT' | 'LIVE' | 'ARCHIVED';
  creationDate: number;
  lastModifiedDate: number;
  lastPublishedDate: number;
}

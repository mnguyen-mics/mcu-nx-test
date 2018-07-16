export interface KeywordListResource {
  id: string;
  list_type: string;
  name: string;
  organisation_id: string;
}

export interface KeywordListSelectionCreateRequest {
  keyword_list_id: string;
  exclude: boolean;
}

export interface KeywordListSelectionResource
  extends KeywordListSelectionCreateRequest {
  id: string;
  name: string;
  technical_name?: string;
}

export interface KeywordResource extends KeywordCreateRequest{
  id: string;
}

export interface KeywordCreateRequest {
  exclude: boolean;
  expression: string;
}
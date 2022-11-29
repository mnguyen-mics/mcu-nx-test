export interface EmailRouterResource {
  id: string;
  name: string;
  organisation_id: string;
  group_id: string;
  artifact_id: string;
  version_value: string;
  version_id: string;
}

export interface EmailRouterSelectionCreateRequest {
  consent_id: string;
}

export interface EmailRouterSelectionResource extends EmailRouterSelectionCreateRequest {
  id: string;
  name: string;
}

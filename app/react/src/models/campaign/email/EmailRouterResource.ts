export interface EmailRouterResource {
  id: string;
  name: string;
  organisation_id: string;
  group_id: string;
  artifact_id: string;
  version_value: string;
  version_id: string;
}

export interface EmailRouterSelectionResource {
  id: string;
  name: string;
  email_router_version_id: string;
}

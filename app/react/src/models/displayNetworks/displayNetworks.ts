// ATYPER CAR FAUX

export interface DisplayNetworkResource {
  id: string;
  list_type: string;
  name: string;
  organisation_id: string;
}

export interface DisplayNetworkSelectionCreateRequest {
  display_network_id: string;
  exclude: boolean;
}

export interface DisplayNetworkSelectionResource extends DisplayNetworkSelectionCreateRequest {
  id: string;
  name: string;
  technical_name?: string;
}

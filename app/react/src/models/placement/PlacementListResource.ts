export interface PlacementListSelectionCreateRequest {
  placement_list_id: string;
  exclude: boolean;
}

export interface PlacementListSelectionResource extends PlacementListSelectionCreateRequest {
  id: string;
  name: string;
  technical_name?: string;
}

export interface PlacementListResource {
  id: string;
  name: string;
}

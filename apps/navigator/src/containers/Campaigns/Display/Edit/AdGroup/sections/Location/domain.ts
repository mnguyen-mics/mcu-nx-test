export interface LocationSelectionCreateRequest {
  geoname_id: string;
  type: string;
  country: string;
  admin1: string;
  admin2: string;
  exclude: boolean;
}

export interface LocationSelectionResource extends LocationSelectionCreateRequest {
  id: string;
}

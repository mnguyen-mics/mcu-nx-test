import { Omit } from './../../../../../../../utils/Types';
export interface LocationSelectionResource {
  id: string;
  geoname_id: string;
  exclude: boolean;
}

export interface LocationFieldModel {
  id: string;
  resource: LocationSelectionResource | Omit<LocationSelectionResource, 'id'>;
  deleted: boolean;
}

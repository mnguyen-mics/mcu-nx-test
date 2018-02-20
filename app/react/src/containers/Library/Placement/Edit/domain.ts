import {
  PlacementDescriptorResource,
  PlacementDescriptorCreateRequest,
} from './../../../../models/placement/PlacementDescriptorResource';
import { PlacementList } from './../../../../models/placementList/PlacementList';
import { FieldArrayModel } from '../../../../utils/FormHelper';

export type PlacementDescriptorFormData =
  | Partial<PlacementDescriptorResource>
  | Partial<PlacementDescriptorCreateRequest>;
export type PlacementDescriptorListFieldModel = FieldArrayModel<
  PlacementDescriptorFormData
>;

export interface PlacementListFormData {
  name: string;
  placementDescriptorList: PlacementDescriptorListFieldModel[];
}

export const INITIAL_PLACEMENT_LIST_DATA: PlacementList = {
  id: '',
  list_type: '',
  name: '',
  organisation_id: '',
};

export const INITIAL_PLACEMENT_DESCRIPTOR: PlacementDescriptorFormData = {
  id: '',
  descriptor_type: '',
  value: '',
  keywords: [],
  placement_holder: '',
};

export const INITIAL_PLACECMENT_LIST_FORM_DATA: PlacementListFormData = {
  name: '',
  placementDescriptorList: [],
};

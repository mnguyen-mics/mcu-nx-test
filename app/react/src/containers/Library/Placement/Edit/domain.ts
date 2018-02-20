import {
  PlacementDescriptorResource,
  PlacementDescriptorCreateRequest,
} from './../../../../models/placement/PlacementDescriptorResource';
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

export const INITIAL_PLACECMENT_LIST_FORM_DATA: PlacementListFormData = {
  name: '',
  placementDescriptorList: [],
};

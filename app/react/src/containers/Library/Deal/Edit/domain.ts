
import { FieldArrayModel } from '../../../../utils/FormHelper';
import { DealResource } from '../../../../models/dealList/dealList';

export interface DealListFormData {
  name: string;
  deals: DealFieldModel[];
}

export type DealFormData = Partial<DealResource>;

export type DealFieldModel = FieldArrayModel<DealFormData>;

export const INITIAL_DEAL_LIST_FORM_DATA: DealListFormData = {
  name: '',
  deals: [],
};

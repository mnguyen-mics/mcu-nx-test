import {
  ServiceItemOfferResource,
  ServiceItemConditionShape,
} from '../../../models/servicemanagement/PublicServiceItemResource';
import { FieldArrayModelWithMeta } from '../../../utils/FormHelper';

export type ServiceConditionsModel = FieldArrayModelWithMeta<
  ServiceItemConditionShape,
  { name: string; type: string }
>;

export interface OfferFormData {
  offer: Partial<ServiceItemOfferResource>;
  serviceConditionFields: ServiceConditionsModel[];
}

export type offerType = 'my_offer' | 'subscribed_offer';

export const INITIAL_SERVICE_OFFER_FORM_DATA: OfferFormData = {
  offer: {},
  serviceConditionFields: [],
};

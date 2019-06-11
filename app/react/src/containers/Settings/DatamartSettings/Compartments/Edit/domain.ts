import { UserAccountCompartmentResource } from '../../../../../models/datamart/DatamartResource'


export interface CompartmentFormData {
  compartment: Partial<UserAccountCompartmentResource>;
  datamartId: string;
}

export const INITIAL_COMPARTMENT_FORM_DATA: CompartmentFormData = {
  compartment: {
  },
  datamartId: "",
};

export interface EditCompartmentRouteMatchParam {
  organisationId: string;
  datamartId: string;
}

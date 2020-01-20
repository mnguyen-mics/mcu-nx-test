import { UserAccountCompartmentDatamartSelectionResource } from '../../../../../models/datamart/DatamartResource';

export type CompartmentFormData = Partial<
  UserAccountCompartmentDatamartSelectionResource
>;

export interface EditCompartmentRouteMatchParam {
  organisationId: string;
  datamartId: string;
  compartmentId: string;
}

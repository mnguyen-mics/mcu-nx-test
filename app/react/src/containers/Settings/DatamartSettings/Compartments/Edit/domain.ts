import { ProcessingSelectionResource } from './../../../../../models/processing';
import { ProcessingActivityFieldModel } from './../../Common/domain';
import { UserAccountCompartmentDatamartSelectionResource } from '../../../../../models/datamart/DatamartResource';

export interface CompartmentFormData {
  compartment: Partial<UserAccountCompartmentDatamartSelectionResource>;
  initialProcessingSelectionResources: ProcessingSelectionResource[];
  processingActivities: ProcessingActivityFieldModel[];
}

export const INITIAL_COMPARTMENT_FORM_DATA: CompartmentFormData = {
  compartment: {},
  initialProcessingSelectionResources: [],
  processingActivities: [],
};

export interface EditCompartmentRouteMatchParam {
  organisationId: string;
  datamartId: string;
  compartmentId: string;
}

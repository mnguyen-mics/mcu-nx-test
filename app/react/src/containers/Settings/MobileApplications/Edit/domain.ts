import { MobileApplicationResource } from '../../../../models/settings/settings';
import { FieldArrayModel } from '../../../../utils/FormHelper';

export interface MobileApplicationFormData {
  mobileapplication: Partial<MobileApplicationResource>;
  visitAnalyzerFields: ActivityAnalyzerFieldModel[];
}

export type ActivityAnalyzerFieldModel = FieldArrayModel<{
  visit_analyzer_model_id: string;
}>;

export const INITIAL_MOBILE_APP_FORM_DATA: MobileApplicationFormData = {
  mobileapplication: {
    type: 'MOBILE_APPLICATION'
  },
  visitAnalyzerFields: [],
};

export interface EditMobileAppRouteMatchParam {
  organisationId: string;
  mobileApplicationId: string;
}

import { MobileApplicationResource } from '../../../../../models/settings/settings';
import { VisitAnalyzerFieldModel } from '../../Common/domain';

export interface MobileApplicationFormData {
  mobileapplication: Partial<MobileApplicationResource>;
  visitAnalyzerFields: VisitAnalyzerFieldModel[];
}


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

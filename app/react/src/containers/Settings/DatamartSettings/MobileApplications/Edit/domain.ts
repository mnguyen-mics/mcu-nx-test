import { ProcessingActivityFieldModel } from './../../Common/domain';
import { ProcessingSelectionResource } from './../../../../../models/processing';
import { MobileApplicationResource } from '../../../../../models/settings/settings';
import {
  VisitAnalyzerFieldModel,
  EventRuleFieldModel,
} from '../../Common/domain';

export interface MobileApplicationFormData {
  mobileapplication: Partial<MobileApplicationResource>;
  visitAnalyzerFields: VisitAnalyzerFieldModel[];
  eventRulesFields: EventRuleFieldModel[];
  initialProcessingSelectionResources: ProcessingSelectionResource[];
  processingActivities: ProcessingActivityFieldModel[];
}

export const INITIAL_MOBILE_APP_FORM_DATA: MobileApplicationFormData = {
  mobileapplication: {
    type: 'MOBILE_APPLICATION',
  },
  visitAnalyzerFields: [],
  eventRulesFields: [],
  initialProcessingSelectionResources: [],
  processingActivities: [],
};

export interface EditMobileAppRouteMatchParam {
  organisationId: string;
  datamartId: string;
  mobileApplicationId: string;
}

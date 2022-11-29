import { ProcessingActivityFieldModel } from './../../Common/domain';
import { ProcessingSelectionResource } from './../../../../../models/processing';
import {
  ChannelVisitAnalyzerSelectionResource,
  MobileApplicationResource,
} from '../../../../../models/settings/settings';
import { VisitAnalyzerFieldModel, EventRuleFieldModel } from '../../Common/domain';

export interface MobileApplicationFormData {
  mobileapplication: Partial<MobileApplicationResource>;
  visitAnalyzerFields: VisitAnalyzerFieldModel[];
  eventRulesFields: EventRuleFieldModel[];
  initialProcessingSelectionResources: ProcessingSelectionResource[];
  initialVisitAnalyzerSelections: ChannelVisitAnalyzerSelectionResource[];
  processingActivities: ProcessingActivityFieldModel[];
}

export const INITIAL_MOBILE_APP_FORM_DATA: MobileApplicationFormData = {
  mobileapplication: {
    type: 'MOBILE_APPLICATION',
  },
  visitAnalyzerFields: [],
  eventRulesFields: [],
  initialProcessingSelectionResources: [],
  initialVisitAnalyzerSelections: [],
  processingActivities: [],
};

export interface EditMobileAppRouteMatchParam {
  organisationId: string;
  datamartId: string;
  mobileApplicationId: string;
}

import { ProcessingSelectionResource } from './../../../../../models/processing';
import { ProcessingActivityFieldModel } from './../../Common/domain';
import { SiteResource, Aliases } from '../../../../../models/settings/settings';
import { VisitAnalyzerFieldModel, EventRuleFieldModel } from '../../Common/domain';
import { FieldArrayModel } from '../../../../../utils/FormHelper';

export interface SiteFormData {
  site: Partial<SiteResource>;
  visitAnalyzerFields: VisitAnalyzerFieldModel[];
  eventRulesFields: EventRuleFieldModel[];
  aliases: AliasesFieldModel[];
  initialProcessingSelectionResources: ProcessingSelectionResource[];
  processingActivities: ProcessingActivityFieldModel[];
}

export type AliasesFieldModel = FieldArrayModel<Aliases>;

export const INITIAL_SITE_FORM_DATA: SiteFormData = {
  site: {
    type: 'SITE',
  },
  visitAnalyzerFields: [],
  eventRulesFields: [],
  aliases: [],
  initialProcessingSelectionResources: [],
  processingActivities: [],
};

export interface EditSiteRouteMatchParam {
  organisationId: string;
  datamartId: string;
  siteId: string;
}

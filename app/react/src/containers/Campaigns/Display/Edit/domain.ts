import { GoalFormData } from '../../Goal/Edit/domain';
import { DisplayCampaignResource } from '../../../../models/campaign/display';
import { GoalSelectionCreateRequest, GoalSelectionResource } from '../../../../models/goal';
import { FieldArrayModel, FieldArrayModelWithMeta } from '../../../../utils/FormHelper';
import { AdGroupFormData } from './AdGroup/domain';

export interface EditDisplayCampaignRouteMatchParam {
  organisationId: string;
  campaignId?: string;
}

export type GoalModelShape = GoalFormData | GoalSelectionCreateRequest | GoalSelectionResource;

export type GoalFieldModel = FieldArrayModelWithMeta<
  GoalModelShape,
  { name: string; triggerMode: string }
>;
export type AdGroupFieldModel = FieldArrayModel<AdGroupFormData>;

export interface DisplayCampaignFormData {
  campaign: Partial<DisplayCampaignResource>;
  goalFields: GoalFieldModel[];
  adGroupFields: AdGroupFieldModel[];
}

export type CampaignType = 'AD_SERVING' | 'PROGRAMMATIC' | 'CAMPAIGN_TRACKING';

export const INITIAL_DISPLAY_CAMPAIGN_FORM_DATA: DisplayCampaignFormData = {
  campaign: {
    model_version: 'V2017_09',
    max_budget_period: 'DAY',
    editor_version_id: '11',
    time_zone: 'Europe/Paris',
    type: 'DISPLAY',
  },
  goalFields: [],
  adGroupFields: [],
};

///////////////////////////
// PREDEFINED TYPE GUARD //
///////////////////////////
export function isGoalFormData(model: GoalModelShape): model is GoalFormData {
  return (model as GoalFormData).goal !== undefined;
}

export function isGoalSelectionResource(model: GoalModelShape): model is GoalSelectionResource {
  return (model as GoalSelectionResource).id !== undefined;
}

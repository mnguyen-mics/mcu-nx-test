import { AutomationNodeShape } from './../../domain';
import {
  ABNNodeResource,
  ScenarioNodeShape,
  DisplayCampaignNodeResource,
  QueryInputNodeResource,
  StartNodeResource,
  EndNodeResource,
  EmailCampaignNodeResource,
} from '../../../../../models/automations/automations';
import {
  LocationFieldModel,
  AdFieldModel,
  BidOptimizerFieldModel,
  InventoryCatalFieldsModel,
} from '../../../../Campaigns/Display/Edit/AdGroup/domain';
import { AdGroupResource, DisplayCampaignResource } from '../../../../../models/campaign/display';
import { ABNAutomationFormProps } from './ABNAutomationForm/ABNAutomationForm';
import { DefaultAutomationFormProps } from './DefaultForm/DefaultAutomationForm';
import { DisplayCampaignAutomationFormProps } from './DisplayCampaignForm/DisplayCampaignAutomationForm';
import {
  TemplateFieldModel,
  ConsentFieldModel,
  BlastFieldModel,
  RouterFieldModel,
} from '../../../../Campaigns/Email/Edit/domain';
import {
  EmailBlastResource,
  EmailBlastCreateRequest,
  EmailCampaignResource,
} from '../../../../../models/campaign/email';
import { EmailCampaignAutomationFormProps } from './EmailCampaignForm/EmailCampaignAutomationForm';

export interface DefaultFormData {
  name: string;
}

export interface ABNFormData extends DefaultFormData {
  branch_number: number;
}

export const INITIAL_DISPLAY_CAMPAIGN_NODE_FORM_DATA: DisplayCampaignAutomationFormData = {
  name: '',
  locationFields: [],
  adGroup: {},
  adFields: [],
  bidOptimizerFields: [],
  inventoryCatalFields: [],
  campaign: {
    organisation_id: '',
    name: '',
    editor_version_id: '11',
    currency_code: 'EUR',
    technical_name: '',
    subtype: 'PROGRAMMATIC',
    max_bid_price: 0,
    total_budget: 0,
    max_budget_per_period: 0,
    max_budget_period: 'WEEK',
    total_impression_capping: 0,
    per_day_impression_capping: 0,
    time_zone: 'Europe/Paris',
    model_version: 'V2017_09',
    type: 'DISPLAY',
  },
};

export const INITIAL_EMAIL_CAMPAIGN_NODE_FORM_DATA: EmailCampaignAutomationFormData = {
  name: '',
  templateFields: [],
  consentFields: [],
  blastFields: [],
  routerFields: [],
  blast: {
    blast_name: '',
    subject_line: '',
    from_email: '',
    from_name: '',
    reply_to: '',
    send_date: 0,
    batch_size: 0,
  },
  campaign: {
    organisation_id: '',
    name: '',
    editor_versionid: '17',
    editor_version_value: '',
    editor_groupid: '',
    editor_artifact_id: '',
    currency_code: 'EUR',
    technical_name: '',
    type: 'EMAIL',
  },
};

export interface DisplayCampaignAutomationFormData extends DefaultFormData {
  locationFields: LocationFieldModel[];
  adGroup: Partial<AdGroupResource>;
  adFields: AdFieldModel[];
  bidOptimizerFields: BidOptimizerFieldModel[];
  inventoryCatalFields: InventoryCatalFieldsModel[];
  campaign: Partial<DisplayCampaignResource>;
}

export interface EmailCampaignAutomationFormData extends DefaultFormData {
  templateFields: TemplateFieldModel[];
  consentFields: ConsentFieldModel[];
  blastFields: BlastFieldModel[];
  routerFields: RouterFieldModel[];
  blast: EmailBlastCreateRequest | EmailBlastResource;
  campaign: Partial<EmailCampaignResource>;
}

export type AutomationFormDataType =
  | DefaultFormData
  | ABNFormData
  | DisplayCampaignAutomationFormData
  | EmailCampaignAutomationFormData;

export type AutomationFormPropsType =
  | ABNAutomationFormProps
  | DefaultAutomationFormProps
  | DisplayCampaignAutomationFormProps
  | EmailCampaignAutomationFormProps;

export const FORM_ID = 'automationNodeForm';

export function isScenarioNodeShape(
  node: AutomationNodeShape,
): node is ScenarioNodeShape {
  return (node as AutomationNodeShape).type !== 'DROP_NODE';
}

export function isAbnNode(node: AutomationNodeShape): node is ABNNodeResource {
  return node.type === 'ABN_NODE';
}

export function isDisplayCampaignNode(
  node: AutomationNodeShape,
): node is DisplayCampaignNodeResource {
  return node.type === 'DISPLAY_CAMPAIGN';
}

export function isEmailCampaignNode(
  node: AutomationNodeShape,
): node is EmailCampaignNodeResource {
  return node.type === 'EMAIL_CAMPAIGN';
}

export function isQueryInputNode(
  node: AutomationNodeShape,
): node is QueryInputNodeResource | StartNodeResource {
  return (
    (node as QueryInputNodeResource | StartNodeResource).type ===
      'QUERY_INPUT' ||
    (node as QueryInputNodeResource | StartNodeResource).type === 'START'
  );
}

export function isEndNode(node: AutomationNodeShape): node is EndNodeResource {
  return node.type === 'GOAL' || node.type === 'FAILURE';
}

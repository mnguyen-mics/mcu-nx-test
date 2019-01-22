import { AutomationNodeShape } from './../../domain';
import {
  ABNNodeResource,
  ScenarioNodeShape,
  DisplayCampaignNodeResource,
  QueryInputNodeResource,
  StartNodeResource,
  EndNodeResource,
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
  EmailCampaignCreateRequest,
  EmailCampaignResource,
} from '../../../../../models/campaign/email';
import { EmailCampaignAutomationFormProps } from './EmailCampaignForm/EmailCampaignAutomationForm';

export interface DefaultFormData {
  name: string;
}

export interface ABNFormData extends DefaultFormData {
  branch_number: number;
}

export interface DisplayCampaignFormData extends DefaultFormData {
  campaign: Partial<DisplayCampaignResource>;
  locationFields: LocationFieldModel[];
  adGroup: Partial<AdGroupResource>;
  adFields: AdFieldModel[];
  bidOptimizerFields: BidOptimizerFieldModel[];
  inventoryCatalFields: InventoryCatalFieldsModel[];
}

export interface EmailCampaignAutomationFormData extends DefaultFormData {
  templateFields: TemplateFieldModel[];
  consentFields: ConsentFieldModel[];
  blastFields: BlastFieldModel[];
  routerFields: RouterFieldModel[];
  blast: Partial<EmailBlastCreateRequest> | EmailBlastResource;
  campaign: Partial<EmailCampaignCreateRequest> | EmailCampaignResource;
}

export type AutomationFormDataType =
  | DefaultFormData
  | ABNFormData
  | DisplayCampaignFormData
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

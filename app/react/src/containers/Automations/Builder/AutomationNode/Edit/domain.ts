import { AutomationNodeShape } from './../../domain';
import {
  ABNNodeResource,
  ScenarioNodeShape,
  DisplayCampaignNodeResource,
} from '../../../../../models/automations/automations';
import {
  LocationFieldModel,
  AdFieldModel,
  BidOptimizerFieldModel,
  InventoryCatalFieldsModel,
} from '../../../../Campaigns/Display/Edit/AdGroup/domain';
import { AdGroupResource } from '../../../../../models/campaign/display';
import { ABNAutomationFormProps } from './ABNAutomationForm/ABNAutomationForm';
import { DefaultAutomationFormProps } from './DefaultForm/DefaultAutomationForm';
import { DisplayCampaignAutomationFormProps } from './DisplayCampaignForm/DisplayCampaignAutomationForm';

export interface DefaultFormData {
  name: string;
}

export interface ABNFormData extends DefaultFormData {
  branch_number: number;
}

export interface DisplayCampaignFormData extends DefaultFormData {
  locationFields: LocationFieldModel[];
  adGroup: Partial<AdGroupResource>;
  adFields: AdFieldModel[];
  bidOptimizerFields: BidOptimizerFieldModel[];
  inventoryCatalFields: InventoryCatalFieldsModel[];
}

export type AutomationFormDataType =
  | DefaultFormData
  | ABNFormData
  | DisplayCampaignFormData;

export type AutomationFormPropsType =
  | ABNAutomationFormProps
  | DefaultAutomationFormProps
  | DisplayCampaignAutomationFormProps;

export const FORM_ID = 'automationNodeForm';

export function isScenarioNodeShape(
  node: AutomationNodeShape,
): node is ScenarioNodeShape {
  return (node as AutomationNodeShape).type !== 'DROP_NODE';
}

export function isAbnNode(node: AutomationNodeShape): node is ABNNodeResource {
  return node.type==='ABN_NODE';
}

export function isDisplayCampaignNode(
  node: AutomationNodeShape,
): node is DisplayCampaignNodeResource {
  return node.type==='DISPLAY_CAMPAIGN';
}

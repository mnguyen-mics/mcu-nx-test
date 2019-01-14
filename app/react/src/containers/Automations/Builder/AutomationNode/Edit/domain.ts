import { AutomationNodeShape } from './../../domain';
import {
  ABNNodeResource,
  ScenarioNodeShape,
  DisplayCampaignNodeResource,
} from '../../../../../models/automations/automations';

export interface AutomationNodeFormData {
  automationNode: {
    branch_number?: number;
    name: string;
    campaign_id?: string;
    ad_group_id?: string;
  };
}

export const FORM_ID = 'automationNodeForm';

export function isScenarioNodeShape(
  node: AutomationNodeShape,
): node is ScenarioNodeShape {
  return (node as AutomationNodeShape).type !== 'DROP_NODE';
}

export function isAbnNode(node: AutomationNodeShape): node is ABNNodeResource {
  return (node as ABNNodeResource).branch_number !== undefined;
}

export function isDisplayCampaignNode(node: AutomationNodeShape): node is DisplayCampaignNodeResource {
  return (node as DisplayCampaignNodeResource).campaign_id !== undefined;
}

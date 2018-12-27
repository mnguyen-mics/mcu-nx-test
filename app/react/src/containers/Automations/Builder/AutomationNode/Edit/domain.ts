import { AutomationNodeShape } from './../../domain';
import {
  ABNNodeResource,
  ScenarioNodeShape,
} from '../../../../../models/automations/automations';

export interface AutomationNodeFormData {
  automationNode: {
    branch_number?: number;
    name: string;
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

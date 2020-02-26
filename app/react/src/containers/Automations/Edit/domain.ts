import { beginNode, edge12, node4, generateBeginNode } from './../Builder/domain';
import { AutomationResource, QueryInputEvaluationPeriodUnit } from '../../../models/automations/automations';
import { StorylineNodeModel } from '../Builder/domain';
import { AutomationSelectedType } from '../Builder/AutomationBuilderPage';

export interface EditAutomationParam {
  organisationId: string;
  automationId?: string;
}

export interface AutomationFormData {
  automation: Partial<AutomationResource>;
  automationTreeData: StorylineNodeModel;
}

export const INITIAL_AUTOMATION_DATA: AutomationFormData = {
  automation: {},
  automationTreeData: {
    node: beginNode(),
    out_edges: [
      {
        in_edge: edge12,
        node: node4,
        out_edges: [],
      },
    ],
  },
};

export const generateInitialAutomationData = (type: AutomationSelectedType, n?: number, p?: QueryInputEvaluationPeriodUnit) => {
  return {
    automation: {},
    automationTreeData: {
      node: generateBeginNode(type, n, p),
      out_edges: [
        {
          in_edge: edge12,
          node: node4,
          out_edges: [],
        },
      ],
    },
  }
}
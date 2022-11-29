import { beginNode, edge12, node4 } from './../Builder/domain';
import {
  AutomationResource,
  ScenarioExitConditionFormResource,
} from '../../../models/automations/automations';
import { StorylineNodeModel } from '../Builder/domain';
import { AutomationSelectedType } from '../Builder/AutomationBuilderPage';
import { generateFakeId } from '../../../utils/FakeIdHelper';

export interface EditAutomationParam {
  organisationId: string;
  automationId?: string;
}

export interface AutomationFormData {
  automation: Partial<AutomationResource>;
  exitCondition: ScenarioExitConditionFormResource;
  automationTreeData: StorylineNodeModel;
}

export const INITIAL_AUTOMATION_DATA: AutomationFormData = {
  automation: {},
  exitCondition: {
    id: generateFakeId(),
    query_id: generateFakeId(),
    type: 'EVENT',
    scenario_id: generateFakeId(),
    formData: {},
    initialFormData: {},
  },
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

export const generateInitialAutomationData = (type: AutomationSelectedType): AutomationFormData => {
  return {
    automation: {},
    exitCondition: {
      id: generateFakeId(),
      query_id: generateFakeId(),
      type: 'EVENT',
      scenario_id: generateFakeId(),
      formData: {},
      initialFormData: {},
    },
    automationTreeData: {
      node: beginNode(type),
      out_edges: [
        {
          in_edge: edge12,
          node: node4,
          out_edges: [],
        },
      ],
    },
  };
};

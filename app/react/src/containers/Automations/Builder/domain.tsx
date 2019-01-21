import cuid from 'cuid';
import { StorylineNodeModel } from './domain';
import {
  ScenarioNodeShape,
  ScenarioEdgeResource,
  StorylineResource,
} from '../../../models/automations/automations';
import {
  AutomationFormDataType,
  isAbnNode,
  ABNFormData,
  DisplayCampaignFormData,
  EmailCampaignAutomationFormData,
} from './AutomationNode/Edit/domain';

export interface TreeNodeOperations {
  addNode: (
    parentNodeId: string,
    childNodeId: string,
    node: ScenarioNodeShape,
  ) => void;
  deleteNode: (nodeId: string) => void;
  updateNode: (
    node: ScenarioNodeShape,
    formData: AutomationFormDataType,
  ) => void;
  updateLayout: () => void;
}

export type AntIcon = 'flag' | 'fork' | 'clock-circle';

export type AutomationNodeShape = ScenarioNodeShape | DropNode;

export class DropNode {
  id: string;
  type: 'DROP_NODE';
  name: string;
  outNode: StorylineNodeModel;
  parentNode: StorylineNodeModel;
  constructor(
    id: string,
    outNode: StorylineNodeModel,
    parentNode: StorylineNodeModel,
  ) {
    this.id = id;
    this.parentNode = parentNode;
    this.outNode = outNode;
  }
}

export interface NodeOperation {
  execute(automationData: StorylineNodeModel): StorylineNodeModel;
}

export class AddNodeOperation implements NodeOperation {
  parentNodeId: string;
  childNodeId: string;
  node: ScenarioNodeShape;

  constructor(
    parentNodeId: string,
    childNodeId: string,
    node: ScenarioNodeShape,
  ) {
    this.childNodeId = childNodeId;
    this.parentNodeId = parentNodeId;
    this.node = node;
  }

  execute(automationData: StorylineNodeModel): StorylineNodeModel {
    return this.iterateData(
      automationData,
      this.parentNodeId,
      this.childNodeId,
    );
  }

  iterateData(
    automationData: StorylineNodeModel,
    parentNodeId: string,
    childNodeId: string,
  ): StorylineNodeModel {
    const outEdges: StorylineNodeModel[] = automationData.out_edges.map(
      (child, index) => {
        if (child.node.id === childNodeId) {
          const inEdgeId: string = cuid();
          const childNode: StorylineNodeModel = {
            node: child.node,
            in_edge: {
              id: inEdgeId,
              source_id: this.node.id,
              target_id: child.node.id,
              handler: 'GOAL',
              scenario_id: child.in_edge!.scenario_id,
            },
            out_edges: child.out_edges,
          };
          const newId = cuid();

          const generateNewEmptyOutEdges = (
            branchNumber: number,
          ): StorylineNodeModel[] => {
            const newEmptyOutEdges = [];
            for (let i = 2; i <= branchNumber; i++) {
              const emptyNode: StorylineNodeModel = {
                node: {
                  id: newId,
                  name: 'Exit from automation',
                  scenario_id: '1',
                  type: 'GOAL',
                },
                in_edge: {
                  id: cuid(),
                  source_id: this.node.id,
                  target_id: newId,
                  handler: 'GOAL',
                  scenario_id: child.in_edge!.scenario_id,
                },
                out_edges: [],
              };
              newEmptyOutEdges.push(emptyNode);
            }
            return newEmptyOutEdges;
          };
          let newOutEdges: StorylineNodeModel[] = [];
          if (this.node.type === 'ABN_NODE') {
            const emptyNodes = generateNewEmptyOutEdges(
              this.node.formData ? this.node.formData.branch_number : 2,
            );
            newOutEdges = [childNode].concat(emptyNodes);
          } else {
            newOutEdges = [childNode];
          }

          const newNode: StorylineNodeModel = {
            node: this.node,
            in_edge: {
              id: 'string',
              source_id: parentNodeId,
              target_id: this.node.id,
              handler: 'ON_VISIT',
              scenario_id: '1',
            },
            out_edges: newOutEdges,
          };
          return newNode;
        } else {
          return this.iterateData(child, parentNodeId, childNodeId);
        }
      },
    );

    return {
      node: automationData.node,
      in_edge: automationData.in_edge,
      out_edges: outEdges,
    };
  }
}

export class DeleteNodeOperation implements NodeOperation {
  idNodeToBeDeleted: string;

  constructor(idNodeToBeDeleted: string) {
    this.idNodeToBeDeleted = idNodeToBeDeleted;
  }

  execute(automationData: StorylineNodeModel): StorylineNodeModel {
    return this.iterateData(automationData, this.idNodeToBeDeleted);
  }

  iterateData(
    automationData: StorylineNodeModel,
    idNodeToBeDeleted: string,
  ): StorylineNodeModel {
    const outEdges: StorylineNodeModel[] = automationData.out_edges.map(
      (child, index) => {
        if (child.node.id === idNodeToBeDeleted) {
          const newNode: StorylineNodeModel = {
            node: {
              id: child.node.id,
              name: 'END NODE',
              scenario_id: '1',
              type: 'FAILURE',
            },
            in_edge: child.in_edge,
            out_edges: [],
          };
          return newNode;
        } else {
          return this.iterateData(child, idNodeToBeDeleted);
        }
      },
    );

    return {
      node: automationData.node,
      in_edge: automationData.in_edge,
      out_edges: outEdges,
    };
  }
}

export class UpdateNodeOperation implements NodeOperation {
  node: AutomationNodeShape;
  formData: AutomationFormDataType;

  constructor(node: ScenarioNodeShape, formData: AutomationFormDataType) {
    this.node = node;
    this.formData = formData;
  }

  execute(automationData: StorylineNodeModel): StorylineNodeModel {
    return this.iterateData(automationData, this.node.id);
  }

  buildUpdatedNode(storylineNode: StorylineNodeModel): StorylineNodeModel {
    let nodeBody: AutomationNodeShape;

    switch (storylineNode.node.type) {
      case 'DISPLAY_CAMPAIGN':
        nodeBody = {
          ...storylineNode.node,
          name: this.formData.name,
          formData: this.formData as DisplayCampaignFormData,
        };
        break;
      case 'EMAIL_CAMPAIGN':
        nodeBody = {
          ...storylineNode.node,
          name: this.formData.name,
          formData: this.formData as EmailCampaignAutomationFormData,
        };
        break;
      case 'ABN_NODE':
        nodeBody = {
          ...storylineNode.node,
          name: this.formData.name,
          formData: this.formData as ABNFormData,
        };
        break;
      default:
        nodeBody = {
          ...storylineNode.node,
          name: this.formData.name,
        };
        break;
    }
    return {
      node: nodeBody,
      in_edge: storylineNode.in_edge,
      out_edges: this.generateOutEdges(storylineNode),
    };
  }

  generateOutEdges = (node: StorylineNodeModel): StorylineNodeModel[] => {
    let newOutEdges: StorylineNodeModel[] = [];
    if (isAbnNode(this.node)) {
      const formBranchNumber = (this.formData as ABNFormData).branch_number;
      const nodeBranchNumber = this.node.formData
        ? this.node.formData.branch_number
        : 2;
      const diff = formBranchNumber - nodeBranchNumber;
      if (diff > 0) {
        const newEmptyOutEdges = this.generateNewEmptyOutEdges(diff, node);
        newOutEdges = node.out_edges.concat(newEmptyOutEdges);
      } else if (diff === 0) {
        newOutEdges = node.out_edges;
      } else {
        const childNodesLeft = node.out_edges.slice(0, formBranchNumber);
        newOutEdges = childNodesLeft;
      }
    } else {
      newOutEdges = node.out_edges;
    }
    return newOutEdges;
  };

  generateNewEmptyOutEdges = (
    branchNumber: number,
    child: StorylineNodeModel,
  ): StorylineNodeModel[] => {
    const newEmptyOutEdges = [];
    for (let i = 1; i <= branchNumber; i++) {
      const newId = cuid();
      const emptyNode: StorylineNodeModel = {
        node: {
          id: newId,
          name: 'Exit from automation',
          scenario_id: '1',
          type: 'GOAL',
        },
        in_edge: {
          id: cuid(),
          source_id: this.node.id,
          target_id: newId,
          handler: 'GOAL',
          scenario_id: child.in_edge!.scenario_id,
        },
        out_edges: [],
      };
      newEmptyOutEdges.push(emptyNode);
    }
    return newEmptyOutEdges;
  };

  iterateData(
    automationData: StorylineNodeModel,
    id: string,
  ): StorylineNodeModel {
    const outEdges: StorylineNodeModel[] = automationData.out_edges.map(
      (child, index) => {
        if (child.node.id === id) {
          const updatedNode: StorylineNodeModel = this.buildUpdatedNode(child);
          return {
            ...updatedNode,
            out_edges: this.generateOutEdges(child),
          };
        } else return this.iterateData(child, id);
      },
    );

    return {
      node: automationData.node,
      in_edge: automationData.in_edge,
      out_edges: outEdges,
    };
  }
}

export interface StorylineNodeModel {
  node: AutomationNodeShape;
  in_edge?: ScenarioEdgeResource;
  out_edges: StorylineNodeModel[];
}

/******************
 * Hardcoded data *
 ******************/

export const storylineResourceData: StorylineResource = {
  begin_node_id: '1',
};

export const beginNode: ScenarioNodeShape = {
  id: '1',
  name: 'Enter automation',
  scenario_id: '1',
  type: 'START',
};

export const node4: ScenarioNodeShape = {
  id: '2',
  name: 'Exit automation',
  scenario_id: '1',
  type: 'GOAL',
};

export const storylineNodeData: ScenarioNodeShape[] = [beginNode, node4];

export const edge12: ScenarioEdgeResource = {
  id: 'string',
  source_id: '1',
  target_id: '2',
  handler: 'ON_VISIT',
  scenario_id: '1',
};

export const storylineEdgeData: ScenarioEdgeResource[] = [edge12];

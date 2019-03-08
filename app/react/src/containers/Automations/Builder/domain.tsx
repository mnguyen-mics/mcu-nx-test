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
  DisplayCampaignAutomationFormData,
  EmailCampaignAutomationFormData,
  WaitFormData,
} from './AutomationNode/Edit/domain';
import { McsIconType } from '../../../components/McsIcon';
import { QueryResource } from '../../../models/datamart/DatamartResource';
import { IQueryService } from '../../../services/QueryService';
import { generateFakeId } from '../../../utils/FakeIdHelper';

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
    initalFormData: AutomationFormDataType,
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

// ADD NODE

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
    const result = this.iterateData(
      automationData,
      this.parentNodeId,
      this.childNodeId,
    );
    return result
  }

  iterateData(
    automationData: StorylineNodeModel,
    parentNodeId: string,
    childNodeId: string,
  ): StorylineNodeModel {
    const outEdges: StorylineNodeModel[] = automationData.out_edges.map(
      (child, index) => {
        if (child.node.id === childNodeId) {
          const inEdgeId: string = generateFakeId();
          const childNode: StorylineNodeModel = {
            node: child.node,
            in_edge: {
              id: inEdgeId,
              source_id: this.node.id,
              target_id: child.node.id,
              handler: 'OUT',
              scenario_id: child.in_edge!.scenario_id,
            },
            out_edges: child.out_edges,
          };
          const newId = generateFakeId();

          const generateNewEmptyOutEdges = (
            branchNumber: number,
          ): StorylineNodeModel[] => {
            const newEmptyOutEdges = [];
            for (let i = 2; i <= branchNumber; i++) {
              const emptyNode: StorylineNodeModel = {
                node: {
                  id: newId,
                  name: 'Exit automation',
                  scenario_id: '',
                  type: 'END_NODE',
                },
                in_edge: {
                  id: generateFakeId(),
                  source_id: this.node.id,
                  target_id: newId,
                  handler: 'OUT',
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
              id: generateFakeId(),
              source_id: parentNodeId,
              target_id: this.node.id,
              handler: this.node.type === 'DISPLAY_CAMPAIGN' ? 'ON_VISIT' : 'OUT',
              scenario_id: '',
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


// DELETE NODE

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
        if (
          child.node.id === idNodeToBeDeleted &&
          child.node.type === 'ABN_NODE'
        ) {
          const newNode: StorylineNodeModel = {
            node: {
              id: child.node.id,
              name: 'Exit Automation',
              scenario_id: '',
              type: 'END_NODE',
            },
            in_edge: child.in_edge,
            out_edges: [],
          };
          return newNode;
        } else if (
          child.node.id === idNodeToBeDeleted &&
          child.node.type !== 'ABN_NODE'
        ) {
          return {
            node: child.out_edges[0].node,
            in_edge: child.out_edges[0].in_edge,
            out_edges: child.out_edges[0].out_edges,
          };
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

// UPDATE NODE

export class UpdateNodeOperation implements NodeOperation {
  node: AutomationNodeShape;
  formData: AutomationFormDataType;
  initialFormData: AutomationFormDataType;

  constructor(
    node: ScenarioNodeShape,
    formData: AutomationFormDataType,
    initialFormData: AutomationFormDataType,
  ) {
    this.node = node;
    this.formData = formData;
    this.initialFormData = initialFormData;
  }

  execute(automationData: StorylineNodeModel): StorylineNodeModel {
    return this.iterateData(automationData, this.node.id, true);
  }

  buildUpdatedNode(storylineNode: StorylineNodeModel): StorylineNodeModel {
    let nodeBody: AutomationNodeShape;

    switch (storylineNode.node.type) {
      case 'DISPLAY_CAMPAIGN':
        nodeBody = {
          ...storylineNode.node,
          name: this.formData.name,
          formData: this.formData as DisplayCampaignAutomationFormData,
          initialFormData: this
            .initialFormData as DisplayCampaignAutomationFormData,
        };
        break;
      case 'EMAIL_CAMPAIGN':
        nodeBody = {
          ...storylineNode.node,
          name: this.formData.name,
          formData: this.formData as EmailCampaignAutomationFormData,
          // todo initial form values
        };
        break;
      case 'ABN_NODE':
        nodeBody = {
          ...storylineNode.node,
          branch_number: (this.formData as ABNFormData).branch_number,
          edges_selection: (this.formData as ABNFormData).edges_selection,
          name: this.formData.name,
          formData: this.formData as ABNFormData,
        };
        break;
      case 'QUERY_INPUT':
        nodeBody = {
          ...storylineNode.node,
          name: this.formData.name,
          formData: this.formData as Partial<QueryResource>,
        };
        break;
      case 'WAIT_NODE':
        nodeBody = {
          ...storylineNode.node,
          timeout: (this.formData as WaitFormData).timeout,
          name: this.formData.name,
          formData: this.formData as WaitFormData,
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
          scenario_id: '',
          type: 'END_NODE',
        },
        in_edge: {
          id: cuid(),
          source_id: this.node.id,
          target_id: newId,
          handler: 'OUT',
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
    firstNode?: boolean
  ): StorylineNodeModel {

    let node = automationData;
    if (firstNode && automationData.node.id === id) {
      node = this.buildUpdatedNode(automationData) as StorylineNodeModel
    }

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
      ...node,
      out_edges: outEdges,
    };
  }
}

export interface StorylineNodeModel {
  node: AutomationNodeShape;
  in_edge?: ScenarioEdgeResource;
  out_edges: StorylineNodeModel[];
}

const beginNodeId = generateFakeId();
const endNodeId = generateFakeId();
const baseEdgeId = generateFakeId();
const baseQueryId = generateFakeId()

export const storylineResourceData: StorylineResource = {
  begin_node_id: beginNodeId,
};

export const beginNode: ScenarioNodeShape = {
  id: beginNodeId,
  name: 'Enter automation',
  scenario_id: '',
  type: 'QUERY_INPUT',
  query_id: baseQueryId,
  evaluation_mode: 'LIVE',
  formData: {
  },
};

export const node4: ScenarioNodeShape = {
  id: endNodeId,
  name: 'Exit automation',
  scenario_id: '',
  type: 'END_NODE',
};

export const storylineNodeData: ScenarioNodeShape[] = [beginNode, node4];

export const edge12: ScenarioEdgeResource = {
  id: baseEdgeId,
  source_id: beginNodeId,
  target_id: endNodeId,
  handler: 'OUT',
  scenario_id: '',
};

export const storylineEdgeData: ScenarioEdgeResource[] = [edge12];

export function generateNodeProperties(
  node: AutomationNodeShape,
): {
  color: string;
  iconType?: McsIconType;
  iconAnt?: AntIcon;
  branchNumber?: number;
} {
  switch (node.type) {
    case 'DISPLAY_CAMPAIGN':
      return {
        iconType: 'display',
        color: '#0ba6e1',
      };
    case 'EMAIL_CAMPAIGN':
      return {
        iconType: 'email',
        color: '#0ba6e1',
      };
    case 'QUERY_INPUT':
      return {
        iconAnt: 'flag',
        color: '#fbc02d',
      };
    case 'ABN_NODE':
      return {
        iconAnt: 'fork',
        color: '#fbc02d',
        branchNumber: node.branch_number,
      };
    case 'END_NODE':
      return {
        iconType: 'check',
        color: '#18b577',
      };
    case 'WAIT_NODE':
      return {
        iconAnt: 'clock-circle',
        color: '#fbc02d',
      };
    default:
      return {
        iconType: 'info',
        color: '#fbc02d',
      };
  }
}

export const buildAutomationTreeData = (
  storylineData: StorylineResource,
  nodeData: ScenarioNodeShape[],
  edgeData: ScenarioEdgeResource[],
  queryService: IQueryService,
  datamartId?: string,
): Promise<StorylineNodeModel> => {
  const node: AutomationNodeShape = nodeData.filter(
    n => n.id === storylineData.begin_node_id,
  )[0];
  const outNodesId: string[] = edgeData
    .filter(e => node && e.source_id === node.id)
    .map(e => e.target_id);
  const outNodes: ScenarioNodeShape[] = nodeData.filter(n =>
    outNodesId.includes(n.id),
  );

  if (
    node.type === 'QUERY_INPUT' &&
    node.query_id &&
    datamartId &&
    queryService
  ) {
    return queryService.getQuery(datamartId, node.query_id).then(res => {
      return {
        node: {
          ...node,
          formData: res.data,
        },
        out_edges: outNodes.map(n =>
          buildStorylineNodeModel(n, nodeData, edgeData, node),
        ),
      };
    });
  } else {
    return Promise.resolve({
      node: node,
      out_edges: outNodes.map(n =>
        buildStorylineNodeModel(n, nodeData, edgeData, node),
      ),
    });
  }
};

export function buildStorylineNodeModel(
  node: ScenarioNodeShape,
  nodeData: ScenarioNodeShape[],
  edgeData: ScenarioEdgeResource[],
  parentNode: AutomationNodeShape,
): any {
  const outNodesId: string[] = edgeData
    .filter(e => e.source_id === node.id)
    .map(e => e.target_id);
  const outNodes: ScenarioNodeShape[] = nodeData.filter(n =>
    outNodesId.includes(n.id),
  );
  const inEdge: ScenarioEdgeResource = edgeData.filter(
    e => e.source_id === parentNode.id && e.target_id === node.id,
  )[0];

  return {
    node: node,
    in_edge: inEdge,
    out_edges: outNodes.map(n =>
      buildStorylineNodeModel(n, nodeData, edgeData, node),
    ),
  };
}

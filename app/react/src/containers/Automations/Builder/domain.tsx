import {
  ScenarioNodeShape,
  ScenarioEdgeResource,
  StorylineResource,
  DisplayCampaignNodeResource,
  EmailCampaignNodeResource,
  ABNNodeResource,
  QueryInputNodeResource,
  WaitNodeResource,
  EdgeHandler,
  AddToSegmentNodeResource,
  DeleteFromSegmentNodeResource,
  OnSegmentEntryInputNodeResource,
  IfNodeResource,
  CustomActionNodeResource,
} from '../../../models/automations/automations';
import {
  AutomationFormDataType,
  isAbnNode,
  ABNFormData,
  DisplayCampaignAutomationFormData,
  EmailCampaignAutomationFormData,
  WaitFormData,
  isIfNode,
  AddToSegmentAutomationFormData,
  isScenarioNodeShape,
  DeleteFromSegmentAutomationFormData,
  OnSegmentEntryInputAutomationFormData,
  QueryInputAutomationFormData,
  isAddToSegmentNode,
  isDeleteFromSegmentNode,
  CustomActionAutomationFormData,
} from './AutomationNode/Edit/domain';
import { McsIconType } from '../../../components/McsIcon';
import { QueryResource } from '../../../models/datamart/DatamartResource';
import { IQueryService } from '../../../services/QueryService';
import { generateFakeId } from '../../../utils/FakeIdHelper';
import {
  ObjectLikeTypeResource,
  FieldResource,
} from '../../../models/datamart/graphdb/RuntimeSchema';
import { AutomationSelectedType } from './AutomationBuilderPage';
import { LabeledValue } from 'antd/lib/select';
import { isAggregateResult } from '../../../models/datamart/graphdb/OTQLResult';
import { QueryDocument } from '../../../models/datamart/graphdb/QueryDocument';
import { IRuntimeSchemaService } from '../../../services/RuntimeSchemaService';
import { reducePromises } from '../../../utils/PromiseHelper';
import { defineMessages, FormattedMessage } from 'react-intl';

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

export type AntIcon = 'flag' | 'fork' | 'clock-circle' | 'branches';

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

export const findLastAddedNode = (
  automationData: StorylineNodeModel,
): StorylineNodeModel | undefined => {
  if (automationData.out_edges.length > 0) {
    const findNode = (
      nodeModel: StorylineNodeModel,
    ): StorylineNodeModel | undefined => {
      if (nodeModel.out_edges.length === 0) {
        return undefined;
      } else {
        if (isScenarioNodeShape(nodeModel.node)) {
          if (nodeModel.node.last_added_node) return nodeModel;
        }
        return nodeModel.out_edges.reduce((previous, current) => {
          if (
            previous &&
            isScenarioNodeShape(previous.node) &&
            previous.node.last_added_node
          )
            return previous;
          return findNode(current);
        }, undefined as StorylineNodeModel | undefined);
      }
    };

    return findNode(automationData);
  }

  return isScenarioNodeShape(automationData.node) &&
    automationData.node.last_added_node
    ? automationData
    : undefined;
};

export const cleanLastAdded = (
  automationData: StorylineNodeModel,
): StorylineNodeModel => {
  const outEdges: StorylineNodeModel[] = automationData.out_edges.map(child => {
    if (child.out_edges.length === 0) {
      return child;
    } else {
      if (isScenarioNodeShape(child.node)) {
        return cleanLastAdded({
          ...child,
          node: {
            ...child.node,
            last_added_node: false,
          },
        });
      } else {
        return cleanLastAdded(child);
      }
    }
  });

  return {
    node: isScenarioNodeShape(automationData.node)
      ? { ...automationData.node, last_added_node: false }
      : automationData.node,
    in_edge: automationData.in_edge,
    out_edges: outEdges,
  };
};

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
      cleanLastAdded(automationData),
      this.parentNodeId,
      this.childNodeId,
    );
    return result;
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

          let newOutEdges: StorylineNodeModel[] = [];

          if (isAbnNode(this.node)) {
            const emptyNodes = this.generateNewEmptyOutEdges(
              child,
              this.node.formData ? this.node.formData.branch_number : 2,
            );
            newOutEdges = [childNode].concat(emptyNodes);
          } else if (isIfNode(this.node)) {
            const emptyNodes = this.generateNewEmptyOutEdges(child, 2);
            newOutEdges = [childNode].concat(emptyNodes);

            const firstEdge = newOutEdges[0];
            const secondEdge = newOutEdges[1];

            if (firstEdge.in_edge !== undefined) {
              firstEdge.in_edge.handler = 'IF_CONDITION_TRUE';
            }
            if (secondEdge.in_edge !== undefined) {
              secondEdge.in_edge.handler = 'IF_CONDITION_FALSE';
            }
          } else {
            newOutEdges = [childNode];
          }
          const newNode: StorylineNodeModel = {
            node: {
              ...this.node,
              last_added_node: true,
            },
            in_edge: {
              id: generateFakeId(),
              source_id: parentNodeId,
              target_id: this.node.id,
              handler: this.getInEdgeHandler(child),
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

  generateNewEmptyOutEdges = (
    child: StorylineNodeModel,
    branchNumber: number,
  ): StorylineNodeModel[] => {
    const newId = generateFakeId();

    const newEmptyOutEdges = [];
    for (let i = 2; i <= branchNumber; i++) {
      const emptyNode: StorylineNodeModel = {
        node: {
          id: newId,
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

  getInEdgeHandler(child: StorylineNodeModel): EdgeHandler {
    if (
      child.in_edge !== undefined &&
      (child.in_edge.handler === 'IF_CONDITION_TRUE' ||
        child.in_edge.handler === 'IF_CONDITION_FALSE')
    ) {
      return child.in_edge.handler;
    } else if (this.node.type === 'DISPLAY_CAMPAIGN') {
      return 'ON_VISIT';
    } else {
      return 'OUT';
    }
  }
}

// DELETE NODE

export class DeleteNodeOperation implements NodeOperation {
  idNodeToBeDeleted: string;

  constructor(idNodeToBeDeleted: string) {
    this.idNodeToBeDeleted = idNodeToBeDeleted;
  }

  execute(automationData: StorylineNodeModel): StorylineNodeModel {
    return cleanLastAdded(
      this.iterateData(
        this.removeSegmentFromDeletedAddToSegmentNode(
          this.idNodeToBeDeleted,
          automationData,
        ),
        this.idNodeToBeDeleted,
      ),
    );
  }

  iterateData(
    automationData: StorylineNodeModel,
    idNodeToBeDeleted: string,
    parentData?: StorylineNodeModel,
  ): StorylineNodeModel {
    const outEdges: StorylineNodeModel[] = automationData.out_edges.map(
      (storyLineModel, index) => {
        if (
          storyLineModel.node.id === idNodeToBeDeleted &&
          (isAbnNode(storyLineModel.node) || isIfNode(storyLineModel.node))
        ) {
          const newNode: StorylineNodeModel = {
            node: {
              id: storyLineModel.node.id,
              scenario_id: '',
              type: 'END_NODE',
            },
            in_edge: storyLineModel.in_edge,
            out_edges: [],
          };
          return newNode;
        } else if (
          storyLineModel.node.id === idNodeToBeDeleted &&
          !isAbnNode(storyLineModel.node) &&
          !isIfNode(storyLineModel.node)
        ) {
          const inEdge = storyLineModel.in_edge;
          const storylineNodeModel: StorylineNodeModel = {
            node: storyLineModel.out_edges[0].node,
            in_edge: inEdge
              ? {
                  ...inEdge,
                  source_id: automationData.node.id,
                  target_id: inEdge.target_id,
                }
              : undefined,
            out_edges: storyLineModel.out_edges[0].out_edges,
          };
          return storylineNodeModel;
        } else {
          return this.iterateData(
            storyLineModel,
            idNodeToBeDeleted,
            automationData,
          );
        }
      },
    );

    return {
      node: automationData.node,
      in_edge: automationData.in_edge,
      out_edges: outEdges,
    };
  }

  removeSegmentFromDeletedAddToSegmentNode(
    nodeIdToBeDeleted: string,
    automationData: StorylineNodeModel,
  ): StorylineNodeModel {
    const removeSegmentFromDeletedAddToSegmentNodeRec = (
      nodeIdToDeleted: string,
      storylinesModels: StorylineNodeModel[],
      segmentIdToDelete?: string,
    ): StorylineNodeModel[] => {
      return storylinesModels.map(storylineModel => {
        const node = storylineModel.node;
        if (node.id === nodeIdToDeleted && isAddToSegmentNode(node)) {
          return {
            ...storylineModel,
            out_edges: removeSegmentFromDeletedAddToSegmentNodeRec(
              nodeIdToDeleted,
              storylineModel.out_edges,
              node.formData.audienceSegmentId, // audienceSegmentId to deleted found
            ),
          };
        } else if (
          segmentIdToDelete &&
          isDeleteFromSegmentNode(node) &&
          node.formData.segmentId === segmentIdToDelete
        ) {
          // same segmentId found, remove it from DELETE_FROM_SEGMENT_NODE form
          return {
            ...storylineModel,
            node: {
              ...node,
              formData: {
                ...node.formData,
                segmentId: undefined,
              },
            },
            out_edges: removeSegmentFromDeletedAddToSegmentNodeRec(
              nodeIdToDeleted,
              storylineModel.out_edges,
              segmentIdToDelete,
            ),
          };
        }
        return {
          ...storylineModel,
          out_edges: removeSegmentFromDeletedAddToSegmentNodeRec(
            nodeIdToDeleted,
            storylineModel.out_edges,
            segmentIdToDelete,
          ),
        };
      });
    };

    return {
      ...automationData,
      out_edges: removeSegmentFromDeletedAddToSegmentNodeRec(
        nodeIdToBeDeleted,
        automationData.out_edges,
      ),
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
    return cleanLastAdded(this.iterateData(automationData, this.node.id, true));
  }

  buildUpdatedNode(storylineNode: StorylineNodeModel): StorylineNodeModel {
    let nodeBody: AutomationNodeShape;

    switch (storylineNode.node.type) {
      case 'DISPLAY_CAMPAIGN':
        nodeBody = {
          ...storylineNode.node,
          ...(this.node as DisplayCampaignNodeResource),
          formData: this.formData as DisplayCampaignAutomationFormData,
          initialFormData: this
            .initialFormData as DisplayCampaignAutomationFormData,
        };
        break;
      case 'EMAIL_CAMPAIGN':
        nodeBody = {
          ...storylineNode.node,
          ...(this.node as EmailCampaignNodeResource),
          formData: this.formData as EmailCampaignAutomationFormData,
          initialFormData: this
            .initialFormData as EmailCampaignAutomationFormData,
        };
        break;
      case 'ADD_TO_SEGMENT_NODE':
        const addToSegmentFormData = this
          .formData as AddToSegmentAutomationFormData;

        // generate fake id if id null
        const audienceSegmentId = addToSegmentFormData.audienceSegmentId
          ? addToSegmentFormData.audienceSegmentId
          : generateFakeId();

        const addToSegmentFormDataUpdated = {
          ...addToSegmentFormData,
          audienceSegmentId: audienceSegmentId,
        };

        nodeBody = {
          ...storylineNode.node,
          ...(this.node as AddToSegmentNodeResource),
          formData: addToSegmentFormDataUpdated,
          initialFormData: this
            .initialFormData as AddToSegmentAutomationFormData,
        };
        break;
      case 'DELETE_FROM_SEGMENT_NODE':
        const deleteFromSegmentFormData = this
          .formData as DeleteFromSegmentAutomationFormData;
        nodeBody = {
          ...storylineNode.node,
          ...(this.node as DeleteFromSegmentNodeResource),
          formData: deleteFromSegmentFormData,
          initialFormData: this
            .initialFormData as DeleteFromSegmentAutomationFormData,
        };
        break;
      case 'ABN_NODE':
        nodeBody = {
          ...storylineNode.node,
          ...(this.node as ABNNodeResource),
          branch_number: (this.formData as ABNFormData).branch_number,
          edges_selection: (this.formData as ABNFormData).edges_selection,
          formData: this.formData as ABNFormData,
        };
        break;
      case 'ON_SEGMENT_EXIT_INPUT_NODE':
      case 'ON_SEGMENT_ENTRY_INPUT_NODE':
        nodeBody = {
          ...storylineNode.node,
          ...(this.node as OnSegmentEntryInputNodeResource),
          formData: this.formData as OnSegmentEntryInputAutomationFormData,
          initialFormData: this
            .initialFormData as OnSegmentEntryInputAutomationFormData,
        };
        break;
      case 'QUERY_INPUT':
        nodeBody = {
          ...storylineNode.node,
          ...(this.node as QueryInputNodeResource),
          formData: this.formData as QueryInputAutomationFormData,
        };
        break;
      case 'IF_NODE':
        nodeBody = {
          ...storylineNode.node,
          ...(this.node as IfNodeResource),
          formData: this.formData as Partial<QueryResource>,
        };
        break;
      case 'WAIT_NODE':
        nodeBody = {
          ...storylineNode.node,
          ...(this.node as WaitNodeResource),
          formData: this.formData as WaitFormData,
        };
        break;
      case 'CUSTOM_ACTION_NODE':
        nodeBody = {
          ...storylineNode.node,
          ...(this.node as CustomActionNodeResource),
          formData: this.formData as CustomActionAutomationFormData,
        };
        break;
      default:
        nodeBody = {
          ...storylineNode.node,
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
      const newId = generateFakeId();
      const emptyNode: StorylineNodeModel = {
        node: {
          id: newId,
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

  iterateData(
    automationData: StorylineNodeModel,
    id: string,
    firstNode?: boolean,
  ): StorylineNodeModel {
    let node = automationData;
    if (firstNode && automationData.node.id === id) {
      node = this.buildUpdatedNode(automationData) as StorylineNodeModel;
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
const baseQueryId = generateFakeId();

export const storylineResourceData: StorylineResource = {
  begin_node_id: beginNodeId,
};

export const beginNode = (type?: AutomationSelectedType): ScenarioNodeShape => {
  if (type === 'ON_SEGMENT_ENTRY' || type === 'ON_SEGMENT_EXIT') {
    return type === 'ON_SEGMENT_ENTRY'
      ? {
          id: beginNodeId,
          type: 'ON_SEGMENT_ENTRY_INPUT_NODE',
          scenario_id: 'string',
          last_added_node: true,
          audience_segment_id: '',
          formData: {},
          initialFormData: {},
        }
      : {
          id: beginNodeId,
          type: 'ON_SEGMENT_EXIT_INPUT_NODE',
          scenario_id: 'string',
          last_added_node: true,
          audience_segment_id: '',
          formData: {},
          initialFormData: {},
        };
  }

  return {
    id: beginNodeId,
    scenario_id: '',
    type: 'QUERY_INPUT',
    query_id: baseQueryId,
    evaluation_mode: 'LIVE',
    ui_creation_mode:
      type === 'REACT_TO_EVENT' ? 'REACT_TO_EVENT_STANDARD' : 'QUERY',
    last_added_node: true,
    formData: {
      uiCreationMode:
        type === 'REACT_TO_EVENT' ? 'REACT_TO_EVENT_STANDARD' : 'QUERY',
    },
  };
};

export const node4: ScenarioNodeShape = {
  id: endNodeId,
  scenario_id: '',
  type: 'END_NODE',
};

export const storylineNodeData: ScenarioNodeShape[] = [beginNode(), node4];

export const edge12: ScenarioEdgeResource = {
  id: baseEdgeId,
  source_id: beginNodeId,
  target_id: endNodeId,
  handler: 'OUT',
  scenario_id: '',
};

export const storylineEdgeData: ScenarioEdgeResource[] = [edge12];

type FormatMessageHandler = (
  messageDescriptor: FormattedMessage.MessageDescriptor,
  values?: { [key: string]: string | number | boolean | Date },
) => string;

export function generateNodeProperties(
  node: AutomationNodeShape,
  formatMessage: FormatMessageHandler,
): {
  title: string;
  subtitle: string;
  color: string;
  iconType?: McsIconType;
  iconAnt?: AntIcon;
  branchNumber?: number;
} {
  switch (node.type) {
    case 'DISPLAY_CAMPAIGN':
      return {
        title: node.formData.campaign.name
          ? node.formData.campaign.name
          : formatMessage(nodeMessages.displayCampaignNodeTitle),
        subtitle: formatMessage(nodeMessages.displayCampaignNodeSubtitle),
        iconType: 'display',
        color: '#0ba6e1',
      };
    case 'EMAIL_CAMPAIGN':
      return {
        title: node.formData.campaign.name
          ? node.formData.campaign.name
          : formatMessage(nodeMessages.emailCampaignNodeTitle),
        subtitle: '',
        iconType: 'email',
        color: '#0ba6e1',
      };
    case 'ADD_TO_SEGMENT_NODE':
      return {
        title: node.formData.audienceSegmentName
          ? node.formData.audienceSegmentName
          : formatMessage(nodeMessages.addToSegmentNodeTitle),
        subtitle: '',
        iconType: 'user-list',
        color: '#0ba6e1',
      };
    case 'DELETE_FROM_SEGMENT_NODE':
      return {
        title: node.formData.audienceSegmentName
          ? node.formData.audienceSegmentName
          : formatMessage(nodeMessages.deleteFromSegmentNodeTitle),
        subtitle: '',
        iconType: 'user-list',
        color: '#fc3f48',
      };
    case 'QUERY_INPUT':
      let subtitle = '';
      if (node.evaluation_mode === 'PERIODIC') {
        subtitle = formatMessage(nodeMessages.periodicQueryInputNodeSubtitle, {
          frequency: node.evaluation_period ? node.evaluation_period : '',
          timeUnit: node.evaluation_period_unit
            ? node.evaluation_period_unit
            : '',
        });
      } else {
        subtitle = formatMessage(nodeMessages.livequeryInputNodeSubtitle);
      }
      return {
        title: formatMessage(nodeMessages.queryInputNodeTitle),
        subtitle: subtitle,
        iconAnt: 'flag',
        color: '#fbc02d',
      };
    case 'ON_SEGMENT_ENTRY_INPUT_NODE':
      return {
        title: formatMessage(nodeMessages.onAudienceSegmentEntryNodeTitle),
        subtitle: formatMessage(
          nodeMessages.onAudienceSegmentEntryNodeSubtitle,
        ),
        iconAnt: 'flag',
        color: '#fbc02d',
      };
    case 'ON_SEGMENT_EXIT_INPUT_NODE':
      return {
        title: formatMessage(nodeMessages.onAudienceSegmentExitNodeTitle),
        subtitle: formatMessage(nodeMessages.onAudienceSegmentExitNodeSubtitle),
        iconAnt: 'flag',
        color: '#fbc02d',
      };
    case 'ABN_NODE':
      return {
        title: formatMessage(nodeMessages.abnNodeTitle),
        subtitle: '',
        iconAnt: 'fork',
        color: '#fbc02d',
        branchNumber: node.branch_number,
      };
    case 'IF_NODE':
      return {
        title: formatMessage(nodeMessages.ifNodeTitle),
        subtitle: '',
        iconAnt: 'branches',
        color: '#fbc02d',
      };
    case 'END_NODE':
      return {
        title: formatMessage(nodeMessages.endNodeTitle),
        subtitle: '',
        iconType: 'check',
        color: '#18b577',
      };
    case 'WAIT_NODE':
      return {
        title: formatMessage(nodeMessages.waitNodeTitle),
        subtitle: '',
        iconAnt: 'clock-circle',
        color: '#fbc02d',
      };
    case 'CUSTOM_ACTION_NODE':
      return {
        title: formatMessage(nodeMessages.customActionNodeTitle),
        subtitle: '',
        iconType: 'bolt',
        color: '#0ba6e1',
      };
    default:
      return {
        title: 'Node',
        subtitle: '',
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
    node &&
    node.type === 'QUERY_INPUT' &&
    node.query_id &&
    datamartId &&
    queryService
  ) {
    return queryService.getQuery(datamartId, node.query_id).then(res => {
      const queryInputNode: QueryInputNodeResource = {
        ...node,
        formData: {
          ...res.data,
          uiCreationMode:
            node.ui_creation_mode === 'REACT_TO_EVENT_STANDARD' ||
            node.ui_creation_mode === 'REACT_TO_EVENT_ADVANCED'
              ? node.ui_creation_mode
              : 'REACT_TO_EVENT_STANDARD',
        },
      };
      return {
        node: queryInputNode,
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

export type WizardValidObjectTypeField = {
  objectTypeName: string;
  fieldName: string;
  objectTypeQueryName?: string;
};
export const wizardValidObjectTypes: WizardValidObjectTypeField[] = [
  { objectTypeName: 'ActivityEvent', fieldName: 'nature' },
  { objectTypeName: 'ActivityEvent', fieldName: 'name' },
  { objectTypeName: 'UserEvent', fieldName: 'nature' },
  { objectTypeName: 'UserEvent', fieldName: 'name' },
];

export const getValidObjectTypesForWizardReactToEvent = (
  objectTypes: ObjectLikeTypeResource[],
): ObjectLikeTypeResource[] => {
  return objectTypes.filter(
    objectType =>
      !!wizardValidObjectTypes.find(
        validObjectType => validObjectType.objectTypeName === objectType.name,
      ),
  );
};

export const getValidFieldsForWizardReactToEvent = (
  objectType: ObjectLikeTypeResource,
  fields: FieldResource[],
): FieldResource[] => {
  return fields.filter(
    field =>
      !!wizardValidObjectTypes.find(
        validObjectType =>
          validObjectType.objectTypeName === objectType.name &&
          field.name === validObjectType.fieldName,
      ),
  );
};

export const getEventsNames = (
  datamartId: string,
  validObjectType: WizardValidObjectTypeField,
  queryService: IQueryService,
): Promise<LabeledValue[]> => {
  if (!validObjectType || !validObjectType.objectTypeQueryName)
    return Promise.resolve([]);

  const query: QueryDocument = {
    from: 'UserPoint',
    operations: [
      {
        selections: [
          {
            name: validObjectType.objectTypeQueryName,
            selections: [
              {
                name: validObjectType.fieldName,
                directives: [{ name: 'map' }],
              },
            ],
          },
        ],
      },
    ],
  };

  return queryService
    .runJSONOTQLQuery(datamartId, query, { use_cache: true })
    .then(oTQLDataResponse => {
      if (isAggregateResult(oTQLDataResponse.data.rows)) {
        return oTQLDataResponse.data.rows[0];
      } else {
        throw new Error('err');
      }
    })
    .then(oTQLAggregationResult => {
      return oTQLAggregationResult.aggregations.buckets[0];
    })
    .then(oTQLBuckets => {
      return oTQLBuckets.buckets.map(({ key }) => ({ key: key, label: key }));
    })
    .catch(() => {
      return [];
    });
};

export type PredefinedEventNames =
  | '$home_view'
  | '$item_list_view'
  | '$item_view'
  | '$basket_view'
  | '$transaction_confirmed'
  | '$conversion'
  | '$ad_click'
  | '$ad_view'
  | '$email_click'
  | '$email_view';

export const predefinedEventNames = [
  '$home_view',
  '$item_list_view',
  '$item_view',
  '$basket_view',
  '$transaction_confirmed',
  '$conversion',
  '$ad_click',
  '$ad_view',
  '$email_click',
  '$email_view',
];

export const getDatamartPredefinedEventNames = (
  datamartId: string,
  validObjectType: WizardValidObjectTypeField,
  queryService: IQueryService,
): Promise<PredefinedEventNames[]> => {
  if (!validObjectType || !validObjectType.objectTypeQueryName)
    return Promise.resolve([]);

  const query = `select {${validObjectType.objectTypeQueryName}{${validObjectType.fieldName}@map(limit:500)}} from UserPoint `;

  return queryService
    .runOTQLQuery(datamartId, query, { use_cache: true })
    .then(oTQLDataResponse => {
      if (isAggregateResult(oTQLDataResponse.data.rows)) {
        return oTQLDataResponse.data.rows[0];
      } else {
        throw new Error('err');
      }
    })
    .then(oTQLAggregationResult => {
      return oTQLAggregationResult.aggregations.buckets[0];
    })
    .then(oTQLBuckets => {
      return oTQLBuckets.buckets
        .map(({ key }) => key)
        .filter(eventName =>
          predefinedEventNames.includes(eventName),
        ) as PredefinedEventNames[];
    })
    .catch(() => {
      return [];
    });
};

export const getValidObjectType = (
  datamartId: string,
  runtimeSchemaService: IRuntimeSchemaService,
): Promise<WizardValidObjectTypeField | undefined> => {
  return runtimeSchemaService
    .getRuntimeSchemas(datamartId)
    .then(({ data: schemas }) => {
      const runtimeSchema = schemas.find(schema => schema.status === 'LIVE');

      if (!runtimeSchema) return;

      return runtimeSchemaService
        .getObjectTypes(datamartId, runtimeSchema.id)
        .then(({ data: objectTypes }) => {
          return reducePromises(
            getValidObjectTypesForWizardReactToEvent(objectTypes).map(
              validObjectType => {
                return runtimeSchemaService
                  .getFields(datamartId, runtimeSchema.id, validObjectType.id)
                  .then(({ data: fields }) => {
                    return {
                      objectType: validObjectType,
                      validFields: getValidFieldsForWizardReactToEvent(
                        validObjectType,
                        fields,
                      ),
                    };
                  });
              },
            ),
          ).then(validObjectTypes => {
            /*
				Here we need to find a WizardValidObjectTypeField
				For each WizardValidObjectTypeField we check if we have an objectType with 
				the same WizardValidObjectTypeField.objectTypeName in validObjectTypes and if 
				its fields contain at least one with the WizardValidObjectTypeField.fieldName.
				*/
            const wizardValidObjectTypesFitlered = wizardValidObjectTypes.find(
              automationWizardValidObjectType =>
                !!validObjectTypes.find(
                  validObjectType =>
                    validObjectType.objectType.name ===
                      automationWizardValidObjectType.objectTypeName &&
                    !!validObjectType.validFields.find(
                      of =>
                        of.name === automationWizardValidObjectType.fieldName,
                    ),
                ),
            );

            if (!wizardValidObjectTypesFitlered) return;

            /*
				We need to fetch the ObjectType UserPoint as it refers to our valid object type, 
				thus we can have its usable name to use in a query.
				For example: ActivityEvent => activity_events
				*/
            const userPointObjectType = objectTypes.find(
              o => o.name === 'UserPoint',
            );

            if (userPointObjectType) {
              return runtimeSchemaService
                .getFields(datamartId, runtimeSchema.id, userPointObjectType.id)
                .then(upFields => {
                  const field = upFields.data.find(
                    f =>
                      f.field_type.match(/\w+/)![0] ===
                      wizardValidObjectTypesFitlered.objectTypeName,
                  );

                  if (field)
                    return {
                      ...wizardValidObjectTypesFitlered,
                      objectTypeQueryName: field ? field.name : undefined,
                    };

                  return;
                });
            } else return;
          });
        });
    });
};

const nodeMessages = defineMessages({
  queryInputNodeTitle: {
    id: 'automation.builder.node.queryInput.title',
    defaultMessage: 'Start Automation',
  },
  livequeryInputNodeSubtitle: {
    id: 'automation.builder.node.queryInput.live.subtitle',
    defaultMessage: 'Live evaluation',
  },
  periodicQueryInputNodeSubtitle: {
    id: 'automation.builder.node.queryInput.periodic.title',
    defaultMessage: 'Evaluated every {frequency} {timeUnit}',
  },
  onAudienceSegmentEntryNodeTitle: {
    id: 'automation.builder.node.onAudienceSegmentEntry.title',
    defaultMessage: 'Start Automation',
  },
  onAudienceSegmentEntryNodeSubtitle: {
    id: 'automation.builder.node.onAudienceSegmentEntry.subtitle',
    defaultMessage: 'On audience segment entry',
  },
  onAudienceSegmentExitNodeTitle: {
    id: 'automation.builder.node.onAudienceSegmentExit.title',
    defaultMessage: 'Start Automation',
  },
  onAudienceSegmentExitNodeSubtitle: {
    id: 'automation.builder.node.onAudienceSegmentExit.subtitle',
    defaultMessage: 'On audience segment exit',
  },
  displayCampaignNodeTitle: {
    id: 'automation.builder.node.displayCampaign.title',
    defaultMessage: 'Display Advertising',
  },
  displayCampaignNodeSubtitle: {
    id: 'automation.builder.node.displayCampaign.subtitle',
    defaultMessage: 'Exit on visit',
  },
  emailCampaignNodeTitle: {
    id: 'automation.builder.node.emailCampaign.title',
    defaultMessage: 'Email Campaign',
  },
  addToSegmentNodeTitle: {
    id: 'automation.builder.node.addToSegment.title',
    defaultMessage: 'Add to Segment',
  },
  deleteFromSegmentNodeTitle: {
    id: 'automation.builder.node.deleteFromSegment.title',
    defaultMessage: 'Delete from Segment',
  },
  abnNodeTitle: {
    id: 'automation.builder.node.abn.title',
    defaultMessage: 'Split',
  },
  ifNodeTitle: {
    id: 'automation.builder.node.if.title',
    defaultMessage: 'If',
  },
  waitNodeTitle: {
    id: 'automation.builder.node.wait.title',
    defaultMessage: 'Wait',
  },
  endNodeTitle: {
    id: 'automation.builder.node.end.title',
    defaultMessage: 'End Automation',
  },
  customActionNodeTitle: {
    id: 'automation.builder.node.customAction.title',
    defaultMessage: 'Custom Action',
  },
});

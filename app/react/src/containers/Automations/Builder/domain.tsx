import { StorylineNodeModel } from './domain';
import {
  ScenarioNodeShape,
  ScenarioEdgeResource,
  StorylineResource,
  DisplayCampaignNodeResource,
  EmailCampaignNodeResource,
  ABNNodeResource,
  QueryInputNodeResource,
  WaitNodeResource,
  QueryInputEvaluationPeriodUnit,
  EdgeHandler,
  AddToSegmentNodeResource,
  DeleteFromSegmentNodeResource,
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
} from './AutomationNode/Edit/domain';
import { McsIconType } from '../../../components/McsIcon';
import { QueryResource } from '../../../models/datamart/DatamartResource';
import { IQueryService } from '../../../services/QueryService';
import { generateFakeId } from '../../../utils/FakeIdHelper';
import { ObjectLikeTypeResource, FieldResource } from '../../../models/datamart/graphdb/RuntimeSchema';
import { AutomationSelectedType } from './AutomationBuilderPage';
import { LabeledValue } from 'antd/lib/select';
import { isAggregateResult } from '../../../models/datamart/graphdb/OTQLResult';
import { QueryDocument } from '../../../models/datamart/graphdb/QueryDocument';
import { IRuntimeSchemaService } from '../../../services/RuntimeSchemaService';
import { reducePromises } from '../../../utils/PromiseHelper';

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


export const findLastAddedNode = (automationData: StorylineNodeModel): StorylineNodeModel | undefined => {
	if(automationData.out_edges.length > 0) {
		const findNode = (nodeModel: StorylineNodeModel): StorylineNodeModel | undefined => {
			if(nodeModel.out_edges.length === 0) {
				return undefined;
			} else {
				if (isScenarioNodeShape(nodeModel.node)) {
					if(nodeModel.node.last_added_node)
						return nodeModel;
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

	return isScenarioNodeShape(automationData.node) && automationData.node.last_added_node ? automationData : undefined;
}

export const cleanLastAdded = (automationData: StorylineNodeModel): StorylineNodeModel => {   const outEdges: StorylineNodeModel[] = automationData.out_edges.map(
    (child) => {
      if(child.out_edges.length === 0) {
        return child;
      } else {
        if (isScenarioNodeShape(child.node)) {
          return cleanLastAdded({
            ...child,
            node: {
              ...child.node,
              last_added_node: false,
            }
          });
        } else {
          return cleanLastAdded(child);
        }
      }
    },
  );

  return {
    node: isScenarioNodeShape(automationData.node)
      ? {...automationData.node, last_added_node: false}
      : automationData.node,
    in_edge: automationData.in_edge,
    out_edges: outEdges,
  };
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
      cleanLastAdded(automationData),
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

          let newOutEdges: StorylineNodeModel[] = [];

          if (isAbnNode(this.node)) {
            const emptyNodes = this.generateNewEmptyOutEdges(
              child,
              this.node.formData ? this.node.formData.branch_number : 2,
            );
            newOutEdges = [childNode].concat(emptyNodes);

          } else if (isIfNode(this.node)) {
            const emptyNodes = this.generateNewEmptyOutEdges(child, 2)
            newOutEdges = [childNode].concat(emptyNodes)

            const firstEdge = newOutEdges[0]
            const secondEdge = newOutEdges[1]

            if (firstEdge.in_edge !== undefined) {
              firstEdge.in_edge.handler = 'IF_CONDITION_TRUE'
            }
            if (secondEdge.in_edge !== undefined) {
              secondEdge.in_edge.handler = 'IF_CONDITION_FALSE'
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


  getInEdgeHandler(child: StorylineNodeModel): EdgeHandler {
    if (child.in_edge !== undefined && (child.in_edge.handler === 'IF_CONDITION_TRUE' || child.in_edge.handler === 'IF_CONDITION_FALSE')) {
      return child.in_edge.handler
    } else if (this.node.type === 'DISPLAY_CAMPAIGN') {
      return 'ON_VISIT'
    } else {
      return 'OUT'
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
    return cleanLastAdded(this.iterateData(automationData, this.idNodeToBeDeleted));
  }

  iterateData(
    automationData: StorylineNodeModel,
    idNodeToBeDeleted: string,
    parentData?: StorylineNodeModel
  ): StorylineNodeModel {
    const outEdges: StorylineNodeModel[] = automationData.out_edges.map(
      (child, index) => {
        if (
          child.node.id === idNodeToBeDeleted &&
          (isAbnNode(child.node) || isIfNode(child.node))
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
          !isAbnNode(child.node) && !isIfNode(child.node)
        ) {
          const inEdge = child.in_edge;
          const storylineNodeModel: StorylineNodeModel = {
            node: child.out_edges[0].node,
            in_edge: inEdge ? {
              ...inEdge,
              source_id: automationData.node.id,
              target_id: inEdge.target_id,
            } : undefined,
            out_edges: child.out_edges[0].out_edges,
          }
          return storylineNodeModel;
        } else {
          return this.iterateData(child, idNodeToBeDeleted, automationData);
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
    return cleanLastAdded(this.iterateData(automationData, this.node.id, true));
  }

  buildUpdatedNode(storylineNode: StorylineNodeModel): StorylineNodeModel {
    let nodeBody: AutomationNodeShape;

    switch (storylineNode.node.type) {
      case 'DISPLAY_CAMPAIGN':
        nodeBody = {
          ...storylineNode.node,
          ...this.node as DisplayCampaignNodeResource,
          name: this.formData.name,
          formData: this.formData as DisplayCampaignAutomationFormData,
          initialFormData: this
            .initialFormData as DisplayCampaignAutomationFormData,
        };
        break;
      case 'EMAIL_CAMPAIGN':
        nodeBody = {
          ...storylineNode.node,
          ...this.node as EmailCampaignNodeResource,
          name: this.formData.name,
          formData: this.formData as EmailCampaignAutomationFormData,
          initialFormData: this
            .initialFormData as EmailCampaignAutomationFormData,
        };
        break;
      case 'ADD_TO_SEGMENT_NODE':
        const addToSegmentFormData = this.formData as AddToSegmentAutomationFormData;
        nodeBody = {
          ...storylineNode.node,
          ...this.node as AddToSegmentNodeResource,
          name: addToSegmentFormData.name && addToSegmentFormData.name  || 'undefined segment name',
          formData: addToSegmentFormData,
          initialFormData: this
            .initialFormData as AddToSegmentAutomationFormData,
        };
        break;
      case 'DELETE_FROM_SEGMENT_NODE':
        const deleteFromSegmentFormData = this.formData as DeleteFromSegmentAutomationFormData;
        nodeBody = {
          ...storylineNode.node,
          ...this.node as DeleteFromSegmentNodeResource,
          name: deleteFromSegmentFormData.name && deleteFromSegmentFormData.name  || 'undefined segment name',
          formData: deleteFromSegmentFormData,
          initialFormData: this
            .initialFormData as DeleteFromSegmentAutomationFormData,
        };
        break;
      case 'ABN_NODE':
        nodeBody = {
          ...storylineNode.node,
          ...this.node as ABNNodeResource,
          branch_number: (this.formData as ABNFormData).branch_number,
          edges_selection: (this.formData as ABNFormData).edges_selection,
          name: this.formData.name,
          formData: this.formData as ABNFormData,
        };
        break;
      case 'QUERY_INPUT':
      case 'IF_NODE':
        nodeBody = {
          ...storylineNode.node,
          ...this.node as QueryInputNodeResource,
          name: this.formData.name,
          formData: this.formData as Partial<QueryResource>,
        };
        break;
      case 'WAIT_NODE':
        nodeBody = {
          ...storylineNode.node,
          ...this.node as WaitNodeResource,
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
      const newId = generateFakeId();
      const emptyNode: StorylineNodeModel = {
        node: {
          id: newId,
          name: 'Exit from automation',
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

export const beginNode = (type?: AutomationSelectedType): ScenarioNodeShape => {
  if (type === 'ON_SEGMENT_ENTRY' || type === 'ON_SEGMENT_EXIT') {
    return type === 'ON_SEGMENT_ENTRY' ? {
      id: beginNodeId,
      type: 'ON_SEGMENT_ENTRY_INPUT_NODE',
      name: "Enter Automation",
      scenario_id: 'string',
      last_added_node: true,
      audience_segment_id: '',
    } :
      {
        id: beginNodeId,
        type: 'ON_SEGMENT_EXIT_INPUT_NODE',
        name: "Enter Automation",
        scenario_id: 'string',
        last_added_node: true,
        audience_segment_id: '',
      };
  }

  return {
    id: beginNodeId,
    name: 'Enter Automation',
    scenario_id: '',
    type: 'QUERY_INPUT',
    query_id: baseQueryId,
    evaluation_mode: 'LIVE',
    ui_creation_mode: type === 'REACT_TO_EVENT' ? 'EVENT' : 'QUERY',
    last_added_node: true,
    formData: {},
  }
};

export const generateBeginNode = (type: AutomationSelectedType, evaluationPeriod?: number, evaluationPeriodUnit?: QueryInputEvaluationPeriodUnit): ScenarioNodeShape => {
  if (type === 'PERIODIC' && evaluationPeriod && evaluationPeriodUnit) {
    return {
      id: beginNodeId,
      name: 'Enter Automation',
      scenario_id: '',
      type: 'QUERY_INPUT',
      query_id: baseQueryId,
      evaluation_mode: 'PERIODIC',
      evaluation_period: evaluationPeriod,
      evaluation_period_unit: evaluationPeriodUnit,
      ui_creation_mode: 'QUERY',
      last_added_node: true,
      formData: {
      },
    }
  }
  return beginNode(type);
}

export const node4: ScenarioNodeShape = {
  id: endNodeId,
  name: 'Exit Automation',
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
    case 'ADD_TO_SEGMENT_NODE':
      return {
        iconType: 'user-list',
        color: '#0ba6e1',
      };
    case 'DELETE_FROM_SEGMENT_NODE':
      return {
        iconType: 'user-list',
        color: '#fc3f48',
      };
    case 'QUERY_INPUT':
      return {
        iconAnt: 'flag',
        color: '#fbc02d',
      };
    case 'ON_SEGMENT_ENTRY_INPUT_NODE':
      return {
        iconAnt: 'flag',
        color: '#fbc02d',
      };
    case 'ON_SEGMENT_EXIT_INPUT_NODE':
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
    case 'IF_NODE':
      return {
        iconAnt: 'branches',
        color: '#fbc02d',
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
    node &&
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

export type WizardValidObjectTypeField = { objectTypeName: string, fieldName: string, objectTypeQueryName?: string };
export const wizardValidObjectTypes: WizardValidObjectTypeField[] = [
  { objectTypeName: 'ActivityEvent', fieldName: 'nature' },
  { objectTypeName: 'ActivityEvent', fieldName: 'name' },
  { objectTypeName: 'UserEvent', fieldName: 'nature' },
  { objectTypeName: 'UserEvent', fieldName: 'name' },
];

export const getValidObjectTypesForWizardReactToEvent = (objectTypes: ObjectLikeTypeResource[]): ObjectLikeTypeResource[] => {
  return objectTypes.filter(objectType =>
    !!wizardValidObjectTypes.find(
      validObjectType => validObjectType.objectTypeName === objectType.name,
    ),
  );
}

export const getValidFieldsForWizardReactToEvent = (objectType: ObjectLikeTypeResource, fields: FieldResource[]): FieldResource[] => {
  return fields.filter(field =>
    !!wizardValidObjectTypes.find(
      validObjectType =>
        validObjectType.objectTypeName === objectType.name &&
        field.name === validObjectType.fieldName,
    ),
  );
}

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
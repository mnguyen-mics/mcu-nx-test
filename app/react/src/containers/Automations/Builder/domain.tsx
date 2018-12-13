import cuid from 'cuid';
import {
  ScenarioNodeShape,
  ScenarioEdgeResource,
  StorylineResource,
} from '../../../models/automations/automations';


export type AutomationNodeShape = ScenarioNodeShape | DropNode;

export class DropNode {
  id: string;
  type: 'DROP_NODE';
  name: 'DROPNODE';
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

export class AddNodeOperation implements NodeOperation{
  parentNodeId: string;
  childNodeId: string;

  constructor(parentNodeId: string, childNodeId: string){
    this.childNodeId = childNodeId;
    this.parentNodeId = parentNodeId;
  }

  execute(automationData: StorylineNodeModel):StorylineNodeModel{
    return this.iterateData(automationData, this.parentNodeId, this.childNodeId);
  }

  iterateData(
    automationData: StorylineNodeModel,
    parentNodeId: string,
    childNodeId: string,
  ): StorylineNodeModel {
    const outEdges: StorylineNodeModel[] = automationData.out_edges.map(
      (child, index) => {
        if (child.node.id === childNodeId) {
          const id : string = cuid(); 
          const newNode: StorylineNodeModel = {
            node: {
              id: id,
              name: 'title',
              scenario_id: '1',
              type: 'QUERY_INPUT',
              query_id: 'string',
              evaluation_mode: 'string',
            },
            in_edge: {
              id: 'string',
              source_id: parentNodeId,
              target_id: id,
              handler: 'ON_VISIT',
              scenario_id: '1',
            },
            out_edges: [child],
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

export class DeleteNodeOperation implements NodeOperation{
  idNodeToBeDeleted: string;

  constructor(idNodeToBeDeleted: string){
    this.idNodeToBeDeleted = idNodeToBeDeleted;
  }

  execute(automationData: StorylineNodeModel):StorylineNodeModel{
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

export interface StorylineNodeModel {
  node: AutomationNodeShape;
  in_edge?: ScenarioEdgeResource;
  out_edges: StorylineNodeModel[];
}

/******************
 * Hardcoded data *
 ******************/

export const storylineResourceData : StorylineResource = {
  begin_node_id : '1'
}

export const beginNode: ScenarioNodeShape = {
  id: '1',
  name: 'Begin node',
  scenario_id: '1',
  type: 'DISPLAY_CAMPAIGN',
  campaign_id: 'string',
  ad_group_id: 'string',
};

export const node2: ScenarioNodeShape = {
  id: '2',
  name: 'node 2',
  scenario_id: '1',
  type: 'DISPLAY_CAMPAIGN',
  campaign_id: 'string',
  ad_group_id: 'string',
};

export const node3: ScenarioNodeShape = {
  id: '3',
  name: 'node 3',
  query_id: '1',
  type: 'QUERY_INPUT',
  evaluation_mode: '',
  scenario_id: '1',
};

export const node4: ScenarioNodeShape = {
  id: '4',
  name: 'success',
  scenario_id: '1',
  type: 'GOAL',
};

export const node5: ScenarioNodeShape = {
  id: '5',
  name: 'node 5',
  scenario_id: '1',
  type: 'FAILURE',
};

export const storylineNodeData : ScenarioNodeShape[] = [
  beginNode, node2, node3, node4, node5
]

export const edge12: ScenarioEdgeResource = {
  id: 'string',
  source_id: '1',
  target_id: '2',
  handler: 'ON_VISIT',
  scenario_id: '1',
};

export const edge13: ScenarioEdgeResource = {
  id: 'string',
  source_id: '1',
  target_id: '3',
  handler: 'ON_VISIT',
  scenario_id: '1',
};

export const edge34: ScenarioEdgeResource = {
  id: 'string',
  source_id: '3',
  target_id: '4',
  handler: 'ON_VISIT',
  scenario_id: '1',
};
export const edge35: ScenarioEdgeResource = {
  id: 'string',
  source_id: '3',
  target_id: '5',
  handler: 'ON_VISIT',
  scenario_id: '1',
};

export const storylineEdgeData : ScenarioEdgeResource[] = [
  edge12, edge13, edge34, edge35
]
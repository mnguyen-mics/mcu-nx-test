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
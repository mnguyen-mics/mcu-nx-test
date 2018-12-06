import {
  ScenarioNodeShape,
  StorylineNodeResource,
  ScenarioEdgeResource,
} from '../../../models/automations/automations';

export type AutomationNodeShape = ScenarioNodeShape | DropNode;

export class DropNode {
  out_edges: StorylineNodeResource;
  parent_id?: StorylineNodeResource;
  constructor(
    out_edge: StorylineNodeResource,
    parent_id?: StorylineNodeResource,
  ) {
    this.parent_id = parent_id;
    this.out_edges = out_edge;
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

export const beginNode: ScenarioNodeShape = {
  id: '1',
  name: 'begin node',
  scenario_id: '1',
  type: 'DISPLAY_CAMPAIGN',
  campaign_id: 'string',
  ad_group_id: 'string',
};

export const edge: ScenarioEdgeResource = {
  id: 'string',
  source_id: 'string',
  target_id: 'string',
  handler: 'ON_VISIT',
  scenario_id: 'string',
};

export const storylineResource: StorylineNodeResource = {
  node: beginNode,
  out_edges: [
    {
      node: beginNode,
      in_edge: edge,
      out_edges: [
        {
          node: beginNode,
          in_edge: edge,
          out_edges: [
            {
              node: beginNode,
              in_edge: edge,
              out_edges: [
                {
                  node: beginNode,
                  in_edge: edge,
                  out_edges: [
                    {
                      node: beginNode,
                      in_edge: edge,
                      out_edges: [],
                    },
                  ],
                },
                {
                  node: beginNode,
                  in_edge: edge,
                  out_edges: [
                    {
                      node: beginNode,
                      in_edge: edge,
                      out_edges: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      node: beginNode,
      in_edge: edge,
      out_edges: [
        {
          node: beginNode,
          in_edge: edge,
          out_edges: [
            {
              node: beginNode,
              in_edge: edge,
              out_edges: [
                {
                  node: beginNode,
                  in_edge: edge,
                  out_edges: [
                    {
                      node: beginNode,
                      in_edge: edge,
                      out_edges: [],
                    },
                  ],
                },
                {
                  node: beginNode,
                  in_edge: edge,
                  out_edges: [
                    {
                      node: beginNode,
                      in_edge: edge,
                      out_edges: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

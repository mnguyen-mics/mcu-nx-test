import * as React from 'react';
import { DiagramEngine, AbstractNodeFactory } from 'storm-react-diagrams';
import DropNodeWidget from './DropNodeWidget';
import DropNodeModel from './DropNodeModel';
import { TreeNodeOperations, StorylineNodeModel, DropNode } from '../domain';

export default class DropNodeFactory extends AbstractNodeFactory<
  DropNodeModel
> {

  treeNodeOperations: TreeNodeOperations;

  constructor(_treeNodeOperations: TreeNodeOperations) {
    super('drop-node');
    this.treeNodeOperations = _treeNodeOperations;
  }

  generateReactWidget(
    diagramEngine: DiagramEngine,
    node: DropNodeModel,
  ): JSX.Element {
    if (node.extras.collapsed) {
      return <div />;
    }
    return React.createElement(DropNodeWidget, {
      node: node,
      diagramEngine: diagramEngine,
      treeNodeOperations: this.treeNodeOperations,
    });
  }

  getNewInstance(initialConfig?: any): DropNodeModel {
    const emptyNode1: StorylineNodeModel = {
        node: {
          id: '1',
          name: 'begin node',
          scenario_id: '1',
          type: 'DISPLAY_CAMPAIGN',
          campaign_id: 'string',
          ad_group_id: 'string',
        },
        out_edges: []
      };
      const emptyNode2: StorylineNodeModel = {
        node: {
          id: '1',
          name: 'begin node',
          scenario_id: '1',
          type: 'DISPLAY_CAMPAIGN',
          campaign_id: 'string',
          ad_group_id: 'string',
        },
        out_edges: []
      };
      const emptyDropNode = new DropNode('1',emptyNode1, emptyNode2);
      return new DropNodeModel(emptyDropNode, 80);
  }
}

import * as React from 'react';
import { DiagramEngine, AbstractNodeFactory } from 'storm-react-diagrams';
import BooleanOperatorNodeWidget from './BooleanOperatorNodeWidget';
import BooleanOperatorNodeModel from './BooleanOperatorNodeModel';
import { TreeNodeOperations } from '../../domain';

export default class BooleanOperatorNodeFactory extends AbstractNodeFactory<
  BooleanOperatorNodeModel
> {
  treeNodeOperations: TreeNodeOperations;

  constructor(_treeNodeOperations: TreeNodeOperations) {
    super('boolean-operator-node');
    this.treeNodeOperations = _treeNodeOperations;
  }

  generateReactWidget(
    diagramEngine: DiagramEngine,
    node: BooleanOperatorNodeModel,
  ): JSX.Element {
    if (node.extras.collapsed) {
      return <div />;
    }
    return React.createElement(BooleanOperatorNodeWidget, {
      node: node,
      diagramEngine: diagramEngine,
      treeNodeOperations: this.treeNodeOperations,
    });
  }

  getNewInstance(initialConfig?: any): BooleanOperatorNodeModel {
    return new BooleanOperatorNodeModel();
  }
}

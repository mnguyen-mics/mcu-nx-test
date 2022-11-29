import * as React from 'react';
import { DiagramEngine, AbstractNodeFactory } from 'storm-react-diagrams';
import DropNodeWidget from './DropNodeWidget';
import DropNodeModel from './DropNodeModel';
import { TreeNodeOperations } from '../domain';

export default class DropNodeFactory extends AbstractNodeFactory<DropNodeModel> {
  treeNodeOperations: TreeNodeOperations;

  constructor(_treeNodeOperations: TreeNodeOperations) {
    super('drop-node');
    this.treeNodeOperations = _treeNodeOperations;
  }

  generateReactWidget(diagramEngine: DiagramEngine, node: DropNodeModel): JSX.Element {
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
    return new DropNodeModel();
  }
}

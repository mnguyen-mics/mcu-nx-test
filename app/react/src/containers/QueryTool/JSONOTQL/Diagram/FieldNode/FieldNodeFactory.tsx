import * as React from 'react';
import { DiagramEngine, AbstractNodeFactory } from 'storm-react-diagrams';
import FieldNodeWidget from './FieldNodeWidget';
import FieldNodeModel from './FieldNodeModel';
import { TreeNodeOperations } from '../../domain';

export default class FieldNodeFactory extends AbstractNodeFactory<
  FieldNodeModel
> {
  treeNodeOperations: TreeNodeOperations;

  constructor(_treeNodeOperations: TreeNodeOperations) {
    super('field-node');
    this.treeNodeOperations = _treeNodeOperations;
  }

  generateReactWidget(
    diagramEngine: DiagramEngine,
    node: FieldNodeModel,
  ): JSX.Element {
    if (node.extras.collapsed) {
      return <div />;
    }
    return React.createElement(FieldNodeWidget, {
      node: node,
      diagramEngine: diagramEngine,
      treeNodeOperations: this.treeNodeOperations,
    });
  }

  getNewInstance(initialConfig?: any): FieldNodeModel {
    return new FieldNodeModel();
  }
}

import * as React from 'react';
import { AbstractNodeFactory } from 'storm-react-diagrams';
import BooleanOperatorNodeWidget from './BooleanOperatorNodeWidget';
import BooleanOperatorNodeModel from './BooleanOperatorNodeModel';
import { TreeNodeOperations, MicsDiagramEngine } from '../../domain';

export default class BooleanOperatorNodeFactory extends AbstractNodeFactory<BooleanOperatorNodeModel> {
  treeNodeOperations: TreeNodeOperations;
  lockGlobalInteraction: (lock: boolean) => void;

  constructor(
    _treeNodeOperations: TreeNodeOperations,
    _lockGlobalInteraction: (lock: boolean) => void,
  ) {
    super('boolean-operator-node');
    this.treeNodeOperations = _treeNodeOperations;
    this.lockGlobalInteraction = _lockGlobalInteraction;
  }

  generateReactWidget(
    diagramEngine: MicsDiagramEngine,
    node: BooleanOperatorNodeModel,
  ): JSX.Element {
    if (node.extras.collapsed) {
      return <div />;
    }
    return React.createElement(BooleanOperatorNodeWidget, {
      node: node,
      diagramEngine: diagramEngine,
      treeNodeOperations: this.treeNodeOperations,
      lockGlobalInteraction: this.lockGlobalInteraction,
    });
  }

  getNewInstance(initialConfig?: any): BooleanOperatorNodeModel {
    return new BooleanOperatorNodeModel();
  }
}

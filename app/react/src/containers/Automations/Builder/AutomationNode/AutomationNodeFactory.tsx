import * as React from 'react';
import { DiagramEngine, AbstractNodeFactory } from 'storm-react-diagrams';
import AutomationNodeWidget from './AutomationNodeWidget';
import AutomationNodeModel from './AutomationNodeModel';
import { TreeNodeOperations } from '../domain';

export default class AutomationNodeFactory extends AbstractNodeFactory<
  AutomationNodeModel
> {
  nodeOperations: TreeNodeOperations;
  updateQueryNode: (nodeId: string, queryText: string) => void;
  lockGlobalInteraction: (locked: boolean) => void;

  constructor(
    nodeOperations: TreeNodeOperations,
    updateQueryNode: (nodeId: string, queryText: string) => void,
    _lockGlobalInteraction: (locked: boolean) => void,
  ) {
    super('automation-node');
    this.nodeOperations = nodeOperations;
    this.updateQueryNode = updateQueryNode;
    this.lockGlobalInteraction = _lockGlobalInteraction;
  }

  generateReactWidget(
    diagramEngine: DiagramEngine,
    node: AutomationNodeModel,
  ): JSX.Element {
    if (node.extras.collapsed) {
      return <div />;
    }
    return React.createElement(AutomationNodeWidget, {
      node: node,
      diagramEngine: diagramEngine,
      nodeOperations: this.nodeOperations,
      updateQueryNode: this.updateQueryNode,
      lockGlobalInteraction: this.lockGlobalInteraction,
    });
  }

  getNewInstance(initialConfig?: any): AutomationNodeModel {
    return new AutomationNodeModel();
  }
}

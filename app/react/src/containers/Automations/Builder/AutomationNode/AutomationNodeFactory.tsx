import * as React from 'react';
import { DiagramEngine, AbstractNodeFactory } from 'storm-react-diagrams';
import AutomationNodeWidget from './AutomationNodeWidget';
import AutomationNodeModel from './AutomationNodeModel';
import { TreeNodeOperations } from '../domain';

export default class AutomationNodeFactory extends AbstractNodeFactory<AutomationNodeModel> {
  nodeOperations: TreeNodeOperations;
  lockGlobalInteraction: (locked: boolean) => void;
  viewer: boolean;
  datamartId: string;

  constructor(
    nodeOperations: TreeNodeOperations,
    _lockGlobalInteraction: (locked: boolean) => void,
    datamartId: string,
    viewer: boolean,
  ) {
    super('automation-node');
    this.nodeOperations = nodeOperations;
    this.lockGlobalInteraction = _lockGlobalInteraction;
    this.viewer = viewer;
    this.datamartId = datamartId;
  }

  generateReactWidget(diagramEngine: DiagramEngine, node: AutomationNodeModel): JSX.Element {
    if (node.extras.collapsed) {
      return <div />;
    }
    return React.createElement(AutomationNodeWidget, {
      node: node,
      diagramEngine: diagramEngine,
      nodeOperations: this.nodeOperations,
      datamartId: this.datamartId,
      lockGlobalInteraction: this.lockGlobalInteraction,
      viewer: this.viewer,
    });
  }

  getNewInstance(initialConfig?: any): AutomationNodeModel {
    return new AutomationNodeModel();
  }
}

import * as React from 'react';
import { DiagramEngine, AbstractNodeFactory } from 'storm-react-diagrams';
import AutomationNodeWidget from './AutomationNodeWidget';
import AutomationNodeModel from './AutomationNodeModel';

export default class AutomationNodeFactory extends AbstractNodeFactory<
  AutomationNodeModel
> {
  constructor() {
    super('automation-node');
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
    });
  }

  getNewInstance(initialConfig?: any): AutomationNodeModel {
    return new AutomationNodeModel(
      'plus',
      'User belongs to ### segment',
      '#2ecc71',
      180,
      90,
    );
  }
}

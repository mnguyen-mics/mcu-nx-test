import * as React from 'react';
import { DiagramEngine, AbstractNodeFactory } from 'storm-react-diagrams';
import AutomationNodeWidget from './AutomationNodeWidget';
import AutomationNodeModel from './AutomationNodeModel';
import { StorylineNodeModel } from '../domain';

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
    const emptyNode: StorylineNodeModel = {
      node: {
        id: '1',
        name: 'begin node',
        scenario_id: '1',
        type: 'DISPLAY_CAMPAIGN',
        campaign_id: 'string',
        ad_group_id: 'string',
      },
      out_edges: []
    }
    return new AutomationNodeModel(emptyNode,
      'plus',
      'User belongs to ### segment',
      '#2ecc71',
      180,
      90,
    );
  }
}

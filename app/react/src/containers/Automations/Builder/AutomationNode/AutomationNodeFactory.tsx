import * as React from 'react';
import { DiagramEngine, AbstractNodeFactory } from 'storm-react-diagrams';
import AutomationNodeWidget from './AutomationNodeWidget';
import AutomationNodeModel from './AutomationNodeModel';
import { JSONQLBuilderContext } from '../../../QueryTool/JSONOTQL/JSONQLBuilderContext';

export default class AutomationNodeFactory extends AbstractNodeFactory<AutomationNodeModel> {
  lockGlobalInteraction: (locked: boolean) => void;
  
  constructor(
    _lockGlobalInteraction: (locked: boolean) => void,
  ) {
    super('plus-node');
    this.lockGlobalInteraction = _lockGlobalInteraction;
  }
  
  generateReactWidget(
    diagramEngine: DiagramEngine,
    node:  AutomationNodeModel,
  ): JSX.Element {
    if (node.extras.collapsed) {
      return <div />;
    }
    return (
      <JSONQLBuilderContext.Consumer>
      {({ query, schema, isTrigger }) =>
      React.createElement( AutomationNodeWidget, {
        node: node,
        diagramEngine: diagramEngine,
        lockGlobalInteraction: this.lockGlobalInteraction,
        query: query,
        schema: schema,
        isTrigger: isTrigger,
      })
    }
    </JSONQLBuilderContext.Consumer>
  );
}

getNewInstance(initialConfig?: any): AutomationNodeModel {
  return new AutomationNodeModel('plus', 'User belongs to ### segment', '#2ecc71');
}
}

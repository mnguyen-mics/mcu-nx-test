import * as React from 'react';
import { DiagramEngine, AbstractNodeFactory } from 'storm-react-diagrams';
import DropNodeWidget from './DropNodeWidget';
import DropNodeModel from './DropNodeModel';
import { ROOT_NODE_POSITION } from '../../../QueryTool/JSONOTQL/domain';

export default class DropNodeFactory extends AbstractNodeFactory<
  DropNodeModel
> {
  constructor() {
    super('drop-node');
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
    });
  }

  getNewInstance(initialConfig?: any): DropNodeModel {
    return new DropNodeModel(ROOT_NODE_POSITION.y);
  }
}

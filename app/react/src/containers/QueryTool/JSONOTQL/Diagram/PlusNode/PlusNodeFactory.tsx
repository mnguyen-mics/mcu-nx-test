import * as React from 'react';
import { DiagramEngine, AbstractNodeFactory } from 'storm-react-diagrams';
import PlusNodeWidget from './PlusNodeWidget';
import PlusNodeModel from './PlusNodeModel';
import { TreeNodeOperations } from '../../domain';
import { ObjectLikeTypeInfoResource } from '../../../../../models/datamart/graphdb/RuntimeSchema';

export default class PlusNodeFactory extends AbstractNodeFactory<
  PlusNodeModel
> {
  treeNodeOperations: TreeNodeOperations;
  objectTypes: ObjectLikeTypeInfoResource[];

  constructor(
    _treeNodeOperations: TreeNodeOperations,
    _objectTypes: ObjectLikeTypeInfoResource[],
  ) {
    super('plus-node');
    this.treeNodeOperations = _treeNodeOperations;
    this.objectTypes = _objectTypes;
  }

  generateReactWidget(
    diagramEngine: DiagramEngine,
    node: PlusNodeModel,
  ): JSX.Element {
    if (node.extras.collapsed) {
      return <div />;
    }
    return React.createElement(PlusNodeWidget, {
      node: node,
      diagramEngine: diagramEngine,
      treeNodeOperations: this.treeNodeOperations,
      objectTypes: this.objectTypes,
    });
  }

  getNewInstance(initialConfig?: any): PlusNodeModel {
    return new PlusNodeModel();
  }
}

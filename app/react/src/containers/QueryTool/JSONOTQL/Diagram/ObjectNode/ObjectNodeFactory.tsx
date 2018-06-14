import * as React from 'react';
import { DiagramEngine, AbstractNodeFactory } from 'storm-react-diagrams';
import ObjectNodeWidget from './ObjectNodeWidget';
import ObjectNodeModel from './ObjectNodeModel';
import { TreeNodeOperations } from '../../domain';
import { ObjectLikeTypeInfoResource } from '../../../../../models/datamart/graphdb/RuntimeSchema';

export default class ObjectNodeFactory extends AbstractNodeFactory<
  ObjectNodeModel
> {
  treeNodeOperations: TreeNodeOperations;
  objectTypes: ObjectLikeTypeInfoResource[];
  lockGlobalInteraction: (locked: boolean) => void;
  

  constructor(_treeNodeOperations: TreeNodeOperations, _objectTypes: ObjectLikeTypeInfoResource[],  _lockGlobalInteraction: (locked: boolean) => void) {
    super('object-node');
    this.treeNodeOperations = _treeNodeOperations;
    this.objectTypes = _objectTypes;
    this.lockGlobalInteraction = _lockGlobalInteraction;
  }

  generateReactWidget(
    diagramEngine: DiagramEngine,
    node: ObjectNodeModel,
  ): JSX.Element {
    if (node.extras.collapsed) {
      return <div />;
    }
    return React.createElement(ObjectNodeWidget, {
      node: node,
      diagramEngine: diagramEngine,
      treeNodeOperations: this.treeNodeOperations,
      objectTypes: this.objectTypes,
      lockGlobalInteraction: this.lockGlobalInteraction
    });
  }

  getNewInstance(initialConfig?: any): ObjectNodeModel {
    return new ObjectNodeModel();
  }
}

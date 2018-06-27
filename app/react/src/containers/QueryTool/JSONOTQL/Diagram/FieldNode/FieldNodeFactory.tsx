import * as React from 'react';
import { DiagramEngine, AbstractNodeFactory } from 'storm-react-diagrams';
import FieldNodeWidget from './FieldNodeWidget';
import { JSONQLBuilderContext } from '../../JSONQLBuilderContext';
import FieldNodeModel from './FieldNodeModel';
import { TreeNodeOperations } from '../../domain';
import { ObjectLikeTypeInfoResource } from '../../../../../models/datamart/graphdb/RuntimeSchema';

export default class FieldNodeFactory extends AbstractNodeFactory<
  FieldNodeModel
> {
  treeNodeOperations: TreeNodeOperations;
  objectTypes: ObjectLikeTypeInfoResource[];
  lockGlobalInteraction: (lock: boolean) => void

  constructor(_treeNodeOperations: TreeNodeOperations,  _objectTypes: ObjectLikeTypeInfoResource[], _lockGlobalInteraction: (lock: boolean) => void) {
    super('field-node');
    this.treeNodeOperations = _treeNodeOperations;
    this.objectTypes = _objectTypes;
    this.lockGlobalInteraction = _lockGlobalInteraction;
  }

  generateReactWidget(
    diagramEngine: DiagramEngine,
    node: FieldNodeModel,
  ): JSX.Element {
    if (node.extras.collapsed) {
      return <div />;
    }
    return (<JSONQLBuilderContext.Consumer>
      {({query}) => React.createElement(FieldNodeWidget, {
        node: node,
        diagramEngine: diagramEngine,
        treeNodeOperations: this.treeNodeOperations,
        objectTypes: this.objectTypes,
        lockGlobalInteraction: this.lockGlobalInteraction,
        query: query as any
      })}
    </JSONQLBuilderContext.Consumer>) 
  }

  getNewInstance(initialConfig?: any): FieldNodeModel {
    return new FieldNodeModel();
  }
}

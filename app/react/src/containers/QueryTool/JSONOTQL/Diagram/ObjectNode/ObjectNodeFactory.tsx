import * as React from 'react';
import { DiagramEngine, AbstractNodeFactory } from 'storm-react-diagrams';
import ObjectNodeWidget from './ObjectNodeWidget';
import ObjectNodeModel from './ObjectNodeModel';
import { TreeNodeOperations } from '../../domain';
import { ObjectLikeTypeInfoResource } from '../../../../../models/datamart/graphdb/RuntimeSchema';
import { JSONQLBuilderContext } from '../../JSONQLBuilderContext';

export default class ObjectNodeFactory extends AbstractNodeFactory<
  ObjectNodeModel
> {
  treeNodeOperations: TreeNodeOperations;
  objectTypes: ObjectLikeTypeInfoResource[];
  lockGlobalInteraction: (locked: boolean) => void;
  datamartId: string;
  

  constructor(_treeNodeOperations: TreeNodeOperations, _objectTypes: ObjectLikeTypeInfoResource[],  _lockGlobalInteraction: (locked: boolean) => void, datamartId: string) {
    super('object-node');
    this.treeNodeOperations = _treeNodeOperations;
    this.objectTypes = _objectTypes;
    this.lockGlobalInteraction = _lockGlobalInteraction;
    this.datamartId = datamartId
  }

  generateReactWidget(
    diagramEngine: DiagramEngine,
    node: ObjectNodeModel,
  ): JSX.Element {
    if (node.extras.collapsed) {
      return <div />;
    }
    return <JSONQLBuilderContext.Consumer>{
      ({query, schema, isTrigger}) => React.createElement(ObjectNodeWidget, {
        node: node,
        diagramEngine: diagramEngine,
        treeNodeOperations: this.treeNodeOperations,
        objectTypes: this.objectTypes,
        lockGlobalInteraction: this.lockGlobalInteraction,
        query: query,
        schema: schema,
        isTrigger: isTrigger,
        datamartId: this.datamartId
      })}
    </JSONQLBuilderContext.Consumer>
  }

  getNewInstance(initialConfig?: any): ObjectNodeModel {
    return new ObjectNodeModel();
  }
}

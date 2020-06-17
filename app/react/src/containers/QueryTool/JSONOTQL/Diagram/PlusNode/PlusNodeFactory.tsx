import * as React from 'react';
import { AbstractNodeFactory } from 'storm-react-diagrams';
import PlusNodeWidget from './PlusNodeWidget';
import PlusNodeModel from './PlusNodeModel';
import { TreeNodeOperations, MicsDiagramEngine } from '../../domain';
import { ObjectLikeTypeInfoResource } from '../../../../../models/datamart/graphdb/RuntimeSchema';
import { JSONQLBuilderContext } from '../../JSONQLBuilderContext';

export default class PlusNodeFactory extends AbstractNodeFactory<
  PlusNodeModel
> {
  treeNodeOperations: TreeNodeOperations;
  objectTypes: ObjectLikeTypeInfoResource[];
  lockGlobalInteraction: (locked: boolean) => void;
  datamartId: string;
  runtimeSchemaId: string;

  constructor(
    _treeNodeOperations: TreeNodeOperations,
    _objectTypes: ObjectLikeTypeInfoResource[],
    _lockGlobalInteraction: (locked: boolean) => void,
    _datamartId: string,
    _runtimeSchemaId: string,
  ) {
    super('plus-node');
    this.treeNodeOperations = _treeNodeOperations;
    this.objectTypes = _objectTypes;
    this.lockGlobalInteraction = _lockGlobalInteraction;
    this.datamartId = _datamartId;
    this.runtimeSchemaId = _runtimeSchemaId;
  }

  generateReactWidget(
    diagramEngine: MicsDiagramEngine,
    node: PlusNodeModel,
  ): JSX.Element {
    if (node.extras.collapsed) {
      return <div />;
    }
    return (
      <JSONQLBuilderContext.Consumer>
        {({ query, schema, isTrigger, isEdge }) =>
          React.createElement(PlusNodeWidget, {
            node: node,
            diagramEngine: diagramEngine,
            treeNodeOperations: this.treeNodeOperations,
            objectTypes: this.objectTypes,
            lockGlobalInteraction: this.lockGlobalInteraction,
            query: query,
            schema: schema,
            isTrigger: isTrigger,
            isEdge: isEdge,
            datamartId: this.datamartId,
            runtimeSchemaId: this.runtimeSchemaId
          })
        }
      </JSONQLBuilderContext.Consumer>
    );
  }

  getNewInstance(initialConfig?: any): PlusNodeModel {
    return new PlusNodeModel();
  }
}

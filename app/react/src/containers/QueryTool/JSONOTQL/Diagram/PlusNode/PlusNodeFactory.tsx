import * as React from 'react';
import { DiagramEngine, AbstractNodeFactory } from 'storm-react-diagrams';
import PlusNodeWidget from './PlusNodeWidget';
import PlusNodeModel from './PlusNodeModel';
import { TreeNodeOperations } from '../../domain';
import { ObjectLikeTypeInfoResource } from '../../../../../models/datamart/graphdb/RuntimeSchema';
import { JSONQLBuilderContext } from '../../JSONQLBuilderContext';

export default class PlusNodeFactory extends AbstractNodeFactory<
  PlusNodeModel
> {
  treeNodeOperations: TreeNodeOperations;
  objectTypes: ObjectLikeTypeInfoResource[];
  lockGlobalInteraction: (locked: boolean) => void;

  constructor(
    _treeNodeOperations: TreeNodeOperations,
    _objectTypes: ObjectLikeTypeInfoResource[],
    _lockGlobalInteraction: (locked: boolean) => void,
  ) {
    super('plus-node');
    this.treeNodeOperations = _treeNodeOperations;
    this.objectTypes = _objectTypes;
    this.lockGlobalInteraction = _lockGlobalInteraction;
  }

  generateReactWidget(
    diagramEngine: DiagramEngine,
    node: PlusNodeModel,
  ): JSX.Element {
    if (node.extras.collapsed) {
      return <div />;
    }
    return (
      <JSONQLBuilderContext.Consumer>
        {({ query, schema, isTrigger }) =>
          React.createElement(PlusNodeWidget, {
            node: node,
            diagramEngine: diagramEngine,
            treeNodeOperations: this.treeNodeOperations,
            objectTypes: this.objectTypes,
            lockGlobalInteraction: this.lockGlobalInteraction,
            query: query,
            schema: schema,
            isTrigger: isTrigger,
          })
        }
      </JSONQLBuilderContext.Consumer>
    );
  }

  getNewInstance(initialConfig?: any): PlusNodeModel {
    return new PlusNodeModel();
  }
}

import * as React from 'react';
import { AbstractNodeFactory } from 'storm-react-diagrams';
import FieldNodeWidget from './FieldNodeWidget';
import FieldNodeModel from './FieldNodeModel';
import { TreeNodeOperations, MicsDiagramEngine } from '../../domain';
import { ObjectLikeTypeInfoResource } from '../../../../../models/datamart/graphdb/RuntimeSchema';
import { AdvancedSegmentBuilderContext } from '../../AdvancedSegmentBuilderContext';

export default class FieldNodeFactory extends AbstractNodeFactory<FieldNodeModel> {
  treeNodeOperations: TreeNodeOperations;
  objectTypes: ObjectLikeTypeInfoResource[];
  lockGlobalInteraction: (lock: boolean) => void;
  keyboardOnlyLock: (lock: boolean) => void;
  datamartId: string;

  constructor(
    _treeNodeOperations: TreeNodeOperations,
    _objectTypes: ObjectLikeTypeInfoResource[],
    _lockGlobalInteraction: (lock: boolean) => void,
    _keyboardOnlyLock: (lock: boolean) => void,
    datamartId: string,
  ) {
    super('field-node');
    this.treeNodeOperations = _treeNodeOperations;
    this.objectTypes = _objectTypes;
    this.lockGlobalInteraction = _lockGlobalInteraction;
    this.keyboardOnlyLock = _keyboardOnlyLock;
    this.datamartId = datamartId;
  }

  generateReactWidget(diagramEngine: MicsDiagramEngine, node: FieldNodeModel): JSX.Element {
    if (node.extras.collapsed) {
      return <div />;
    }
    return (
      <AdvancedSegmentBuilderContext.Consumer>
        {({ runFieldProposal, isEdge }) =>
          React.createElement(FieldNodeWidget, {
            node: node,
            diagramEngine: diagramEngine,
            treeNodeOperations: this.treeNodeOperations,
            objectTypes: this.objectTypes,
            lockGlobalInteraction: this.lockGlobalInteraction,
            keyboardOnlyLock: this.keyboardOnlyLock,
            datamartId: this.datamartId,
            runFieldProposal: runFieldProposal,
            isEdge: isEdge,
          })
        }
      </AdvancedSegmentBuilderContext.Consumer>
    );
  }

  getNewInstance(initialConfig?: any): FieldNodeModel {
    return new FieldNodeModel();
  }
}

import * as React from 'react';
import { ObjectTreeExpressionNodeShape } from '../../../models/datamart/graphdb/QueryDocument';
import { SchemaItem, FieldProposalLookup } from './domain';

export interface AdvancedSegmentBuilderContextProps {
  query: ObjectTreeExpressionNodeShape | undefined;
  schema: SchemaItem | undefined;
  isTrigger: boolean;
  isEdge: boolean;
  runFieldProposal: FieldProposalLookup;
}

const context: AdvancedSegmentBuilderContextProps = {
  query: undefined,
  schema: undefined,
  isTrigger: false,
  isEdge: false,
  runFieldProposal: (treeNodePath: number[]) => Promise.resolve([]),
};

export const AdvancedSegmentBuilderContext = React.createContext(context);

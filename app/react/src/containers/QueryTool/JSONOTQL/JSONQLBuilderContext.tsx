import * as React from 'react';
import { ObjectTreeExpressionNodeShape } from '../../../models/datamart/graphdb/QueryDocument';
import { SchemaItem } from './domain';

export interface JSONQLBuilderContextProps {
  query: ObjectTreeExpressionNodeShape | undefined;
  schema: SchemaItem | undefined;
  isTrigger: boolean;
  runFieldProposal: (treeNodePath: number[]) => Promise<string[]> 
}

const context: JSONQLBuilderContextProps = {
  query: undefined,
  schema: undefined,
  isTrigger: false,
  runFieldProposal: (treeNodePath: number[]) => Promise.resolve([]),
}

export const JSONQLBuilderContext = React.createContext(context);
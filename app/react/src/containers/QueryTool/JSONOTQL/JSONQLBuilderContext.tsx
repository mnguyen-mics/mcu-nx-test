import * as React from 'react';
import { ObjectTreeExpressionNodeShape } from '../../../models/datamart/graphdb/QueryDocument';
import { SchemaItem } from './domain';

export interface JSONQLBuilderContextProps {
  query: ObjectTreeExpressionNodeShape | undefined;
  schema: SchemaItem | undefined;
}

const context: JSONQLBuilderContextProps = {
  query: undefined,
  schema: undefined
}

export const JSONQLBuilderContext = React.createContext(context);
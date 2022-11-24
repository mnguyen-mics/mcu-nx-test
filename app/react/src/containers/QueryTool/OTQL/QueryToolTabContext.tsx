import React from 'react';
import {
  QueryExecutionSource,
  QueryExecutionSubSource,
} from '@mediarithmics-private/advanced-components';

export type QueryToolTabContextType = {
  queryExecutionSource: QueryExecutionSource;
  queryExecutionSubSource: QueryExecutionSubSource;
};

export const QueryToolTabContext = React.createContext<QueryToolTabContextType>({
  queryExecutionSource: 'DASHBOARD',
  queryExecutionSubSource: 'HOME_DASHBOARD',
});

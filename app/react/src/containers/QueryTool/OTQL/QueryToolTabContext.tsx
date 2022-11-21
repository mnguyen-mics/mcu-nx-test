import { ModelType } from '@mediarithmics-private/advanced-components/lib/models/dashboards/dataset/common';
import React from 'react';

export type QueryToolTabContextType = {
  decorators: {
    setDecoratorOptionModelType: (decoratorModelType: ModelType) => void;
    selectedDecorator?: ModelType;
  };
};

export const QueryToolTabContext = React.createContext<QueryToolTabContextType>({
  decorators: {
    setDecoratorOptionModelType: () => {
      return;
    },
  },
});

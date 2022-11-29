import * as React from 'react';
import { compose } from 'recompose';

export interface AnalyticsDimensionValuesMultiSelectProps {
  dimensionValues?: string[];
  dimensionSelectedValues: string[];
  onAnalyticsDimensionValuesChange: (dimensionValues: string[]) => void;
  renderMultiSelect: (
    onSelectChange: (value: string | string[]) => void,
    placeholder: string,
    classname: string,
    options?: string[],
    selectedOptions?: string[],
  ) => React.ReactNode;
}

type Props = AnalyticsDimensionValuesMultiSelectProps;

class AnalyticsDimensionValuesMultiSelect extends React.Component<Props> {
  render() {
    const { renderMultiSelect, dimensionValues, dimensionSelectedValues } = this.props;

    const onDimensionsValuesMultiSelectChange = (value: string | string[]) => {
      const { onAnalyticsDimensionValuesChange } = this.props;
      const values = Array.isArray(value) ? value : [value];
      onAnalyticsDimensionValuesChange(values);
    };

    return renderMultiSelect(
      onDimensionsValuesMultiSelectChange,
      '',
      'mcs-analyticsQueryBuilder_dimensionsInput',
      dimensionValues,
      dimensionSelectedValues,
    );
  }
}

export default compose<{}, AnalyticsDimensionValuesMultiSelectProps>()(
  AnalyticsDimensionValuesMultiSelect,
);

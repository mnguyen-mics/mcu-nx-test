import * as React from 'react';
import PropTypes from 'prop-types';

interface MetricsColumnProps {
  metrics: [{
    name?: string;
    value?: string;
  }];
  isLoading?: boolean;
}

const MetricsColumn: React.SFC<MetricsColumnProps> = props => {

  const {
    metrics,
    isLoading,
  } = props;
  
  const height: number = 375;
  const nbOfVal: number = metrics ? metrics.length : 1;
  const cellHeight: number = height / nbOfVal;

  return (
    <div className="p-r-20 mcs-metrics-column">
      {metrics.map(metric => {
        return (
          <div key={metric.name} style={{ height: `${cellHeight}px` }}>
            <div className="title">{metric.name}</div>
            <div className="metric">{isLoading ? <i className="mcs-table-cell-loading" style={{ width: '130px' }} /> : metric.value}</div>
          </div>);
      })}
    </div>
  );
}

MetricsColumn.defaultProps = {
  isLoading: false,
};

export default MetricsColumn;

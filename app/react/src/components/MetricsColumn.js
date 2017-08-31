import React from 'react';
import PropTypes from 'prop-types';

function MetricsColumn(props) {

  const {
    metrics,
    isLoading,
  } = props;
  const height = 375;
  const nbOfVal = metrics ? metrics.length : 1;
  const cellHeight = height / nbOfVal;

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

MetricsColumn.propTypes = {
  metrics: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.string,
  }).isRequired).isRequired,
  isLoading: PropTypes.bool,
};

export default MetricsColumn;

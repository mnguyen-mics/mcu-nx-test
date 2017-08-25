import React from 'react';
import PropTypes from 'prop-types';

function MetricsFocus(props) {

  const {
    metrics,
    isLoading,
  } = props;
  const height = 375;
  const nbOfVal = metrics ? metrics.length : 1;
  const cellHeight = height / nbOfVal;

  return (
    <div className="" style={{ paddingRight: '20px' }}>
      {metrics.map(metric => {
        return (
          <div key={metric.name} style={{ height: `${cellHeight}px` }}>
            <div style={{ fontSize: '0.9em', textAlign: 'left', color: '#919191' }}>{metric.name}</div>
            <div style={{ fontSize: '2em', fontWeight: 'bold', textAlign: 'left', color: 'rgba(0, 0, 0, 0.65)', lineHeight: '1.25' }}>{isLoading ? <i className="mcs-table-cell-loading" style={{ width: '130px' }} /> : metric.value}</div>
          </div>);
      })}
    </div>
  );
}

MetricsFocus.defaultProps = {
  isLoading: false,
};

MetricsFocus.propTypes = {
  metrics: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.string,
  }).isRequired).isRequired,
  isLoading: PropTypes.bool,
};

export default MetricsFocus;

import React from 'react';
import PropTypes from 'prop-types';

function Progress(props) {
  const {
    percent,
    label,
  } = props;

  let bgClass = 'success';
  if (percent > 50 && percent < 80) {
    bgClass = 'warning';
  } else if (percent >= 80) {
    bgClass = 'error';
  }

  return (
    <div className="mcs-progress-wrapper">
      {label ? (<div className="mcs-progress-label" >{label}</div>) : null}
      <div className="mcs-progress">
        <div className="mcs-progress-outer">
          <div className="mcs-progress-inner">
            <div className={`mcs-progress-bg ${bgClass}`} style={{ width: `${percent}%`, height: '5px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

Progress.defaultProps = {
  label: null,
};

Progress.propTypes = {
  percent: PropTypes.number.isRequired,
  label: PropTypes.string,
};

export default Progress;

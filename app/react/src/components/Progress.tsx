import * as React from 'react';
import PropTypes from 'prop-types';

interface ProgressProps {
  percent: number;
  label?: string;
}

const Progress: React.SFC<ProgressProps> = props => {

  const {
    percent,
    label,
  } = props;

  let bgClass = 'success';
  if (props.percent > 50 && props.percent < 80) {
    bgClass = 'warning';
  } else if (props.percent >= 80) {
    bgClass = 'error';
  }

  return (
    <div className="mcs-progress-wrapper">
      {props.label ? (<div className="mcs-progress-label" >{props.label}</div>) : null}
      <div className="mcs-progress">
        <div className="mcs-progress-outer">
          <div className="mcs-progress-inner">
            <div className={`mcs-progress-bg ${bgClass}`} style={{ width: `${props.percent}%`, height: '5px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

Progress.defaultProps = {
  label: null,
};

export default Progress;

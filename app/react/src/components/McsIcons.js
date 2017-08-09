import React from 'react';
import PropTypes from 'prop-types';

function Icons(props) {
  return (
    <span className="icon" {...props}>
      <i className={`mcs-${props.type}`} />
    </span>
  );
}

Icons.propTypes = {
  type: PropTypes.string.isRequired,
};

export default Icons;

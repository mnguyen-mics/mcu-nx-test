import React from 'react';
import PropTypes from 'prop-types';

function McsIcons(props) {
  return (
    <span className="icon" {...props}>
      <i className={`mcs-${props.type}`} />
    </span>
  );
}

McsIcons.propTypes = {
  type: PropTypes.string.isRequired,
};

export default McsIcons;

import React from 'react';
import PropTypes from 'prop-types';

function ButtonStyleless({ children, className, ...buttonProps }) {
  return (
    <button className={`button-styleless ${className}`} {...buttonProps}>
      {children}
    </button>
  );
}

ButtonStyleless.defaultProps = {
  className: '',
};

ButtonStyleless.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default ButtonStyleless;

import React from 'react';
import PropTypes from 'prop-types';

function List({ children, className }) {

  return (
    <div className={`list-ul ${className}`}>
      <ul>{children}</ul>
    </div>
  );
}

List.defaultProps = {
  className: '',
};

List.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default List;

import React from 'react';
import PropTypes from 'prop-types';
import { Spin } from 'antd';

function Loading({ className }) {
  return (
    <div className={`mcs-centered-container ${className}`}>
      <Spin size="large" />
    </div>
  );
}

Loading.defaultProps = {
  className: '',
};

Loading.propTypes = {
  className: PropTypes.string,
};

export default Loading;

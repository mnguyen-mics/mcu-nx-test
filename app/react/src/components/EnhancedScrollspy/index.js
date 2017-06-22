import React, { Component } from 'react';
import PropTypes from 'prop-types';

const EnhancedScrollspy = (Scrollspy) => {
  return class extends Scrollspy {
    render() {
      const element = React.createElement(Scrollspy, this.props, this.props.children);
      console.log('element');
      return element;
    }
  };
};

export default EnhancedScrollspy;

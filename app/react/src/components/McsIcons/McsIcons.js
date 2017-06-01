import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Icons extends Component {

  render() {

    const {
      type
    } = this.props;

    return (
      <span className="icon" {...this.props}>
        <i className={`mcs-${type}`} />
      </span>
    );
  }
}

Icons.propTypes = {
  type: PropTypes.string.isRequired
};

export default Icons;

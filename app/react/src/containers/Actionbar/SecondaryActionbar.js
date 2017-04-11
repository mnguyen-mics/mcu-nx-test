
import React, { Component, PropTypes } from 'react';

class SecondaryActionbar extends Component {

  render() {
    return (<div>
      {this.props.children}
    </div>);
  }
}

SecondaryActionbar.propTypes = {
  id: PropTypes.string.isRequired // eslint-disable-line react/no-unused-prop-types
};


export default SecondaryActionbar;

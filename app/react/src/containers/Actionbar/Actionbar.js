import React, { Component } from 'react';
import BreadcrumbBar from './BreadcrumbBar';

class Actionbar extends Component {

  render() {

    return (
      <div className="mcs-actionbar-wrapper mcs-actionbar" >
        <BreadcrumbBar className="mcs-actionbar-breadcrumb" />
        <div className="mcs-actionbar-button-wrapper">
          {this.props.children}
        </div>
      </div>
    );
  }

}

export default Actionbar;

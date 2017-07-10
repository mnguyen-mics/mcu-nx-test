import React, { Component } from 'react';
import { Row } from 'antd';
import BreadcrumbBar from './BreadcrumbBar';

class Actionbar extends Component {

  render() {

    return (
      <Row type="flex" align="middle" justify="space-between" className="mcs-actionbar">
        <BreadcrumbBar {...this.props} />
        <div className="left-part-margin">
          {this.props.children}
        </div>
      </Row>
    );
  }

}

export default Actionbar;

import React, { Component } from 'react';
import { Row } from 'antd';

class ScrollComponent extends Component {

  render() {
    return (
      <Row className="mcs-scroll-view">
        { this.props.children }
      </Row>
    );
  }
}

export default ScrollComponent;

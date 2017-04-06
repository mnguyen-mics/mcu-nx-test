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

/*
* EXAMPLE :
*<ScrollComponent>
* {this.props.children}
*</ScrollComponent>
*/

export default ScrollComponent;

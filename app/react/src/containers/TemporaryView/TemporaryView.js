import React, { Component } from 'react';
import { Layout } from 'antd';

class TemporaryView extends Component {
  render() {
    return <Layout className="mcs-main-layout">{this.props.children}</Layout>;
  }
}

export default TemporaryView;

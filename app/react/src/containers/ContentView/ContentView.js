import React, { Component } from 'react';
import { Layout } from 'antd';

class ContentView extends Component {
  render() {
    return <Layout className="mcs-main-layout">{this.props.children}</Layout>;
  }
}

export default ContentView;

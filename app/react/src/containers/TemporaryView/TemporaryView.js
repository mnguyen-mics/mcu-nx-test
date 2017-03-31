import React, { Component } from 'react';
import { Layout } from 'antd';

class TemporaryView extends Component {
  render() {
    return <Layout style={{ height: '100%' }}>{this.props.children}</Layout>;
  }
}

export default TemporaryView;

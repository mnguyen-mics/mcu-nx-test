import React, { Component } from 'react';
import { Layout } from 'antd';

import CreativeSidebar from './CreativeSidebar';


class Creative extends Component {

  render() {
    return (
      <Layout>
        <CreativeSidebar {...this.props}>
          {this.props.children}
        </CreativeSidebar>
      </Layout>
    );
  }
}

export default Creative;

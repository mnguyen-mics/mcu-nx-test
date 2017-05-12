import React, { Component } from 'react';
import { Layout } from 'antd';

import AudienceSidebar from './AudienceSidebar';


class Audience extends Component {

  render() {
    return (
      <Layout>
        <AudienceSidebar {...this.props}>
          {this.props.children}
        </AudienceSidebar>
      </Layout>
    );
  }
}

export default Audience;

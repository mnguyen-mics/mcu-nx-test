import React, { Component } from 'react';
import { Layout } from 'antd';

import LibrarySidebar from './LibrarySidebar';


class Library extends Component {

  render() {
    return (
      <Layout>
        <LibrarySidebar {...this.props} />
      </Layout>
    );
  }
}

export default Library;

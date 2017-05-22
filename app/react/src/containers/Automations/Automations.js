import React, { Component } from 'react';
import { Layout } from 'antd';

import AutomationsSidebar from './AutomationsSidebar';


class Automations extends Component {

  render() {
    return (
      <Layout>
        <AutomationsSidebar {...this.props}>
          {this.props.children}
        </AutomationsSidebar>
      </Layout>
    );
  }
}

export default Automations;

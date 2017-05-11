import React, { Component } from 'react';
import { Layout } from 'antd';

import { ScrollComponent } from '../../../components/ScrollComponent';

import GoalsActionbar from './GoalsActionbar';
import GoalsTable from './GoalsTable';

const { Content } = Layout;

class Goals extends Component {

  render() {

    return (
      <Layout>
        <GoalsActionbar />
        <Content>
          <ScrollComponent>
            <GoalsTable {...this.props} />
          </ScrollComponent>
        </Content>
      </Layout>
    );

  }

}

export default Goals;

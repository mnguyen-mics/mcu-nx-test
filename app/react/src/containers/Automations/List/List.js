import React, { Component } from 'react';
import { Layout } from 'antd';

import { ScrollComponent } from '../../../components/ScrollComponent';

import ListActionbar from './ListActionbar';
import AutomationsListTable from './ListTable';

const { Content } = Layout;

class List extends Component {

  render() {
    return (
      <Layout>
        <ListActionbar />
        <Content>
          <ScrollComponent>
            <AutomationsListTable {...this.props} />
          </ScrollComponent>
        </Content>
      </Layout>
    );

  }

}

export default List;

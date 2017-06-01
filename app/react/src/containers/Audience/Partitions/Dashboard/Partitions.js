import React, { Component } from 'react';
import { Layout } from 'antd';

import { ScrollComponent } from '../../../../components/ScrollComponent';

import PartitonsActionbar from './PartitonsActionbar';
import PartitionsDashboard from './PartitionsDashboard';

const { Content } = Layout;

class Partitions extends Component {

  render() {
    return (
      <Layout>
        <PartitonsActionbar {...this.props} />
        <Content>
          <ScrollComponent>
            <PartitionsDashboard {...this.props} />
          </ScrollComponent>
        </Content>
      </Layout>
    );

  }

}

export default Partitions;

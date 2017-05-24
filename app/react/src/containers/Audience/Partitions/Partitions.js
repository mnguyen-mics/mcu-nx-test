import React, { Component } from 'react';
import { Layout } from 'antd';

import { ScrollComponent } from '../../../components/ScrollComponent';

import PartitonsActionbar from './PartitonsActionbar';
import AudiencePartitionsTable from './AudiencePartitionsTable';

const { Content } = Layout;

class Partitions extends Component {

  render() {
    return (
      <Layout>
        <PartitonsActionbar {...this.props} />
        <Content>
          <ScrollComponent>
            <AudiencePartitionsTable {...this.props} />
          </ScrollComponent>
        </Content>
      </Layout>
    );

  }

}

export default Partitions;

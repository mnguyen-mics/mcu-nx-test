import React, { Component } from 'react';
import { Layout } from 'antd';

import { ScrollComponent } from '../../../../components/ScrollComponent';

import PartitionsActionbar from './PartitionsActionbar';
import AudiencePartitionsTable from './AudiencePartitionsTable';

const { Content } = Layout;

class Partitions extends Component {

  render() {
    return (
      <Layout>
        <PartitionsActionbar {...this.props} />
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

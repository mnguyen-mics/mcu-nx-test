import React, { Component } from 'react';
import { Layout } from 'antd';

import { ScrollComponent } from '../../../components/ScrollComponent';

import SegmentsActionbar from './SegmentsActionbar';
import AudienceSegmentsTable from './AudienceSegmentsTable';

const { Content } = Layout;

class Segments extends Component {

  render() {
    return (
      <Layout>
        <SegmentsActionbar />
        <Content>
          <ScrollComponent>
            <AudienceSegmentsTable {...this.props} />
          </ScrollComponent>
        </Content>
      </Layout>
    );

  }

}

export default Segments;

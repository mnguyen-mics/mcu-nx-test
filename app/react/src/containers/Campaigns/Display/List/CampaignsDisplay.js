import React, { Component } from 'react';
import { Layout } from 'antd';

import { ScrollComponent } from '../../../../components/ScrollComponent';

import CampaignsDisplayActionbar from './CampaignsDisplayActionbar';
import CampaignsDisplayTable from './CampaignsDisplayTable';

const { Content } = Layout;

class CampaignsDisplay extends Component {

  render() {
    return (
      <Layout>
        <CampaignsDisplayActionbar {...this.props} />
        <Content>
          <ScrollComponent>
            <CampaignsDisplayTable {...this.props} />
          </ScrollComponent>
        </Content>
      </Layout>
    );

  }

}

export default CampaignsDisplay;

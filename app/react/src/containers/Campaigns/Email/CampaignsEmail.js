import React, { Component } from 'react';
import { Layout } from 'antd';

import { ScrollComponent } from '../../../components/ScrollComponent';

import CampaignsEmailActionbar from './CampaignsEmailActionbar';
import CampaignsEmailTable from './CampaignsEmailTable';

const { Content } = Layout;

class CampaignsEmail extends Component {

  render() {
    return (
      <Layout>
        <CampaignsEmailActionbar {...this.props} />
        <Content>
          <ScrollComponent>
            <CampaignsEmailTable {...this.props} />
          </ScrollComponent>
        </Content>
      </Layout>
    );
  }

}

export default CampaignsEmail;

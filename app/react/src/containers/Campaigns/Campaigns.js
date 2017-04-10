import React, { Component } from 'react';
import { Layout } from 'antd';

import CampaignsSidebar from './CampaignsSidebar';


class Campaigns extends Component {

  render() {
    return (
      <Layout>
        <CampaignsSidebar {...this.props}>
          {this.props.children}
        </CampaignsSidebar>
      </Layout>
    );
  }
}

export default Campaigns;

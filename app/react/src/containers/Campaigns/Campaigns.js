import React, { Component } from 'react';
import { Layout } from 'antd';
import CampaignsTableView from './CampaignsTableView';

import CampaignsSidebar from './CampaignsSidebar';


class Campaigns extends Component {

  render() {
    return (
      <Layout>
        <CampaignsSidebar {...this.props}>
          <CampaignsTableView isSearchEnabled isDateRangePickerEnabled filters={[]} />
        </CampaignsSidebar>
      </Layout>
    );
  }
}

export default Campaigns;

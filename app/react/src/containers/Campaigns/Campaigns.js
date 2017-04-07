import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Layout } from 'antd';

import CampaignsSidebar from './CampaignsSidebar';
import CampaignsTableView from './CampaignsTableView';
import { ScrollComponent } from '../../components/ScrollComponent';
import { LabelListView } from '../../components/LabelListView';


class Campaigns extends Component {

  render() {
    return (
      <Layout>
        <CampaignsSidebar {...this.props}>
          <ScrollComponent>
            <CampaignsTableView isSearchEnabled isDateRangePickerEnabled filters={[]} />
          </ScrollComponent>
        </CampaignsSidebar>
      </Layout>
    );
  }
}

export default Campaigns;

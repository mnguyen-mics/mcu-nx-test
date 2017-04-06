import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Layout } from 'antd';

import CampaignsSidebar from './CampaignsSidebar';
import { ScrollComponent } from '../../components/ScrollComponent';
import { LabelListView } from '../../components/LabelListView';


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

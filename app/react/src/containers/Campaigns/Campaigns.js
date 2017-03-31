import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Layout } from 'antd';

import CampaignsSidebar from './CampaignsSidebar';

class Campaigns extends Component {

  render() {
    return (
      <Layout>
        <CampaignsSidebar {...this.props}>
          { this.props.children || <FormattedMessage id="CAMPAIGN_COMPONENT" /> }
        </CampaignsSidebar>
      </Layout>
    );
  }
}

export default Campaigns;

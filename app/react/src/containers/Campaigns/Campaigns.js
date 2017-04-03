import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Layout } from 'antd';

import CampaignsSidebar from './CampaignsSidebar';
import { ScrollComponent } from '../../components/ScrollComponent';

class Campaigns extends Component {

  render() {
    return (
      <Layout>
        <CampaignsSidebar {...this.props}>
          <ScrollComponent>
            <FormattedMessage id="LOREM_IPSUM" />
          </ScrollComponent>
        </CampaignsSidebar>
      </Layout>
    );
  }
}

export default Campaigns;

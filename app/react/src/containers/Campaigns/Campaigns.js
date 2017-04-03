import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Layout, Row } from 'antd';

import CampaignsSidebar from './CampaignsSidebar';

class Campaigns extends Component {

  render() {
    return (
      <Layout>
        <CampaignsSidebar {...this.props}>
          <Row style={{ overflowY: 'scroll', padding: '0 23px' }}>
            <div><FormattedMessage id="FILTERED_BY" /></div>
            { this.props.children || <FormattedMessage id="LOREM_IPSUM" /> }
          </Row>
        </CampaignsSidebar>
      </Layout>
    );
  }
}

export default Campaigns;

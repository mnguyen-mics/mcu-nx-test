import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';

import { ScrollComponent } from '../../../components/ScrollComponent';

import CampaignsDisplayActionbar from './CampaignsDisplayActionbar';
import CampaignsDisplayTable from './CampaignsDisplayTable';

const { Content } = Layout;

class CampaignsDisplay extends Component {

  render() {
    return (
      <Layout>
        <CampaignsDisplayActionbar />
        <Content>
          <ScrollComponent>
            <CampaignsDisplayTable {...this.props} />
          </ScrollComponent>
        </Content>
      </Layout>
    );

  }

}

CampaignsDisplay.propTypes = {
  router: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

export default CampaignsDisplay;

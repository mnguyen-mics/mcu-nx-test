import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';

import { ScrollComponent } from '../../../components/ScrollComponent';

import CampaignsEmailActionbar from './CampaignsEmailActionbar';
import CampaignsEmailTable from './CampaignsEmailTable';

const { Content } = Layout;

class CampaignsEmail extends Component {

  render() {
    return (
      <Layout>
        <CampaignsEmailActionbar />
        <Content>
          <ScrollComponent>
            <CampaignsEmailTable {...this.props} />
          </ScrollComponent>
        </Content>
      </Layout>
    );
  }

}

CampaignsEmail.propTypes = {
  router: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default CampaignsEmail;

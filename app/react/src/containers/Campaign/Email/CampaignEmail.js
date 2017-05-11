import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Layout } from 'antd';

import { ScrollComponent } from '../../../components/ScrollComponent';
import CampaignEmailActionbar from './CampaignEmailActionbar';
import * as CampaignEmailActions from '../../../state/Campaign/Email/actions';

console.log(CampaignEmailActions);
const { Content } = Layout;

class CampaignEmail extends Component {

  componentDidMount() {
    const {
      params: {
        campaignId
      },
      fetchCampaignEmail
    } = this.props;

    fetchCampaignEmail(campaignId);
  }

  render() {
    return (
      <Layout>
        <CampaignEmailActionbar />
        <Content>
          <ScrollComponent />
        </Content>
      </Layout>
    );
  }

}

CampaignEmail.propTypes = {
  params: PropTypes.shape({
    campaignId: PropTypes.string
  }).isRequired,
  fetchCampaignEmail: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => ({
  params: ownProps.router.params
});

const mapDispatchToProps = {
  fetchCampaignEmail: CampaignEmailActions.fetchCampaignEmail
};

CampaignEmail = connect(
  mapStateToProps,
  mapDispatchToProps
)(CampaignEmail);

export default CampaignEmail;

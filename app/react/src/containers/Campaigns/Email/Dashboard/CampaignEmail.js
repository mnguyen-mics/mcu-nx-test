import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Layout } from 'antd';

import { ScrollComponent } from '../../../../components/ScrollComponent';
import CampaignEmailActionbar from './CampaignEmailActionbar';
import CampaignEmailHeader from './CampaignEmailHeader';
import CampaignEmailDashboard from './CampaignEmailDashboard';
import CampaignEmailTable from './CampaignEmailTable';
import * as CampaignEmailActions from '../../../../state/Campaign/Email/actions';

import {
  CAMPAIGN_EMAIL_QUERY_SETTINGS
} from '../../RouteQuerySelector';

import {
  updateQueryWithParams,
  deserializeQuery
} from '../../../../services/RouteQuerySelectorService';

const { Content } = Layout;

class CampaignEmail extends Component {

  constructor(props) {
    super(props);
    this.updateQueryParams = this.updateQueryParams.bind(this);
  }

  componentDidMount() {
    const {
      params: {
        campaignId
      },
      query,
      loadCampaignEmailAndDeliveryReport,
      fetchAllEmailBlast,
      fetchAllEmailBlastPerformance
    } = this.props;

    const filter = deserializeQuery(query, CAMPAIGN_EMAIL_QUERY_SETTINGS);

    fetchAllEmailBlast(campaignId);
    fetchAllEmailBlastPerformance(campaignId, filter);
    loadCampaignEmailAndDeliveryReport(campaignId, filter);
  }

  componentWillUnmount() {
    this.props.resetCampaignEmail();
  }

  updateQueryParams(params) {
    const {
      router,
      query: currentQuery
    } = this.props;

    const location = router.getCurrentLocation();
    router.replace({
      pathname: location.pathname,
      query: updateQueryWithParams(currentQuery, params, CAMPAIGN_EMAIL_QUERY_SETTINGS)
    });
  }

  render() {
    return (
      <Layout>
        <CampaignEmailActionbar {...this.props} />
        <Content>
          <ScrollComponent>
            <CampaignEmailHeader />
            <CampaignEmailDashboard {...this.props} />
            <CampaignEmailTable />
          </ScrollComponent>
        </Content>
      </Layout>
    );
  }

}

CampaignEmail.propTypes = {
  router: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  query: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  params: PropTypes.shape({
    campaignId: PropTypes.string
  }).isRequired,
  loadCampaignEmailAndDeliveryReport: PropTypes.func.isRequired,
  fetchAllEmailBlast: PropTypes.func.isRequired,
  fetchAllEmailBlastPerformance: PropTypes.func.isRequired,
  resetCampaignEmail: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => ({
  params: ownProps.router.params,
  query: ownProps.router.location.query
});

const mapDispatchToProps = {
  fetchAllEmailBlast: CampaignEmailActions.fetchAllEmailBlast.request,
  fetchAllEmailBlastPerformance: CampaignEmailActions.fetchAllEmailBlastPerformance.request,
  loadCampaignEmailAndDeliveryReport: CampaignEmailActions.loadCampaignEmailAndDeliveryReport,
  resetCampaignEmail: CampaignEmailActions.resetCampaignEmail
};

CampaignEmail = connect(
  mapStateToProps,
  mapDispatchToProps
)(CampaignEmail);

export default CampaignEmail;

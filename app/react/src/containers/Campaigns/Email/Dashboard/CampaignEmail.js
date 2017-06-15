import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import CampaignEmailHeader from './CampaignEmailHeader';
import CampaignEmailDashboard from './CampaignEmailDashboard';
import CampaignEmailTable from './CampaignEmailTable';
import * as CampaignEmailActions from '../../../../state/Campaign/Email/actions';

import { EMAIL_DASHBOARD_SEARCH_SETTINGS } from './constants';

import {
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearchs
} from '../../../../utils/LocationSearchHelper';

class CampaignEmail extends Component {

  componentDidMount() {
    const {
      history,
      location: {
        search,
        pathname
      },
      match: {
        params: {
          organisationId,
          campaignId
        }
      },
      loadCampaignEmailAndDeliveryReport,
      fetchAllEmailBlast,
      fetchAllEmailBlastPerformance
    } = this.props;

    if (!isSearchValid(search, EMAIL_DASHBOARD_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, EMAIL_DASHBOARD_SEARCH_SETTINGS)
      });
    } else {
      const filter = parseSearch(search, EMAIL_DASHBOARD_SEARCH_SETTINGS);
      fetchAllEmailBlast(campaignId);
      fetchAllEmailBlastPerformance(campaignId, filter);
      loadCampaignEmailAndDeliveryReport(organisationId, campaignId, filter);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      location: {
        search
      },
      match: {
        params: {
          campaignId
        }
      },
      history,
      loadCampaignEmailAndDeliveryReport,
      fetchAllEmailBlast,
      fetchAllEmailBlastPerformance
    } = this.props;

    const {
      location: {
        pathname: nextPathname,
        search: nextSearch
      },
      match: {
        params: {
          campaignId: nextCampaignId,
          organisationId: nextOrganisationId
        }
      }
    } = nextProps;


    if (!compareSearchs(search, nextSearch) || campaignId !== nextCampaignId) {
      if (!isSearchValid(nextSearch, EMAIL_DASHBOARD_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, EMAIL_DASHBOARD_SEARCH_SETTINGS)
        });
      } else {
        const filter = parseSearch(nextSearch, EMAIL_DASHBOARD_SEARCH_SETTINGS);
        fetchAllEmailBlast(nextCampaignId);
        fetchAllEmailBlastPerformance(nextCampaignId, filter);
        loadCampaignEmailAndDeliveryReport(nextOrganisationId, nextCampaignId, filter);
      }
    }
  }

  componentWillUnmount() {
    this.props.resetCampaignEmail();
  }

  render() {
    return (
      <div>
        <CampaignEmailHeader />
        <CampaignEmailDashboard />
        <CampaignEmailTable />
      </div>
    );
  }

}

CampaignEmail.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  loadCampaignEmailAndDeliveryReport: PropTypes.func.isRequired,
  fetchAllEmailBlast: PropTypes.func.isRequired,
  fetchAllEmailBlastPerformance: PropTypes.func.isRequired,
  resetCampaignEmail: PropTypes.func.isRequired
};

const mapDispatchToProps = {
  fetchAllEmailBlast: CampaignEmailActions.fetchAllEmailBlast.request,
  fetchAllEmailBlastPerformance: CampaignEmailActions.fetchAllEmailBlastPerformance.request,
  loadCampaignEmailAndDeliveryReport: CampaignEmailActions.loadCampaignEmailAndDeliveryReport,
  resetCampaignEmail: CampaignEmailActions.resetCampaignEmail
};

CampaignEmail = connect(
  () => ({}),
  mapDispatchToProps
)(CampaignEmail);

CampaignEmail = withRouter(CampaignEmail);

export default CampaignEmail;

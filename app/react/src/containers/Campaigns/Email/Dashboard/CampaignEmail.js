import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { withRouter, Link } from 'react-router-dom';
import { Button } from 'antd';

import CampaignEmailHeader from './CampaignEmailHeader';
import CampaignEmailDashboard from './CampaignEmailDashboard';
import { Card } from '../../../../components/Card';
import BlastTable from './BlastTable';
import * as CampaignEmailActions from '../../../../state/Campaign/Email/actions';

import { EMAIL_DASHBOARD_SEARCH_SETTINGS } from './constants';

import {
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearchs,
} from '../../../../utils/LocationSearchHelper';

class CampaignEmail extends Component {

  componentDidMount() {
    const {
      history,
      location: {
        search,
        pathname,
      },
      match: {
        params: {
          organisationId,
          campaignId,
        },
      },
      loadCampaignEmailAndDeliveryReport,
      fetchAllEmailBlast,
      fetchAllEmailBlastPerformance,
    } = this.props;

    if (!isSearchValid(search, EMAIL_DASHBOARD_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, EMAIL_DASHBOARD_SEARCH_SETTINGS),
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
        search,
      },
      match: {
        params: {
          campaignId,
        },
      },
      history,
      loadCampaignEmailAndDeliveryReport,
      fetchAllEmailBlast,
      fetchAllEmailBlastPerformance,
    } = this.props;

    const {
      location: {
        pathname: nextPathname,
        search: nextSearch,
      },
      match: {
        params: {
          campaignId: nextCampaignId,
          organisationId: nextOrganisationId,
        },
      },
    } = nextProps;


    if (!compareSearchs(search, nextSearch) || campaignId !== nextCampaignId) {
      if (!isSearchValid(nextSearch, EMAIL_DASHBOARD_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, EMAIL_DASHBOARD_SEARCH_SETTINGS),
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
    const {
      match: {
        params: { organisationId, campaignId },
      },
      translations,
    } = this.props;

    const buttons = (
      <Link to={`/v2/o/${organisationId}/campaigns/email/${campaignId}/blasts/create`}>
        <Button type="primary">
          <FormattedMessage id="NEW_EMAIL_BLAST" />
        </Button>
      </Link>
    );

    return (
      <div>
        <CampaignEmailHeader />
        <CampaignEmailDashboard />
        <Card title={translations.EMAIL_BLASTS} buttons={buttons}>
          <BlastTable />
        </Card>
      </div>
    );
  }

}

CampaignEmail.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
  loadCampaignEmailAndDeliveryReport: PropTypes.func.isRequired,
  fetchAllEmailBlast: PropTypes.func.isRequired,
  fetchAllEmailBlastPerformance: PropTypes.func.isRequired,
  resetCampaignEmail: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  translations: state.translations,
});

const mapDispatchToProps = {
  fetchAllEmailBlast: CampaignEmailActions.fetchAllEmailBlast.request,
  fetchAllEmailBlastPerformance: CampaignEmailActions.fetchAllEmailBlastPerformance.request,
  loadCampaignEmailAndDeliveryReport: CampaignEmailActions.loadCampaignEmailAndDeliveryReport,
  resetCampaignEmail: CampaignEmailActions.resetCampaignEmail,
};

CampaignEmail = connect(
  mapStateToProps,
  mapDispatchToProps,
)(CampaignEmail);

CampaignEmail = withRouter(CampaignEmail);

export default CampaignEmail;

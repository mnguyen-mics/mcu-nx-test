import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { withRouter, Link } from 'react-router-dom';
import { Button } from 'antd';

import EmailCampaignHeader from './EmailCampaignHeader';
import EmailCampaignDashboard from './EmailCampaignDashboard';
import { Card } from '../../../../components/Card';
import BlastTable from './BlastTable';
import * as EmailCampaignActions from '../../../../state/Campaign/Email/actions';

import { EMAIL_DASHBOARD_SEARCH_SETTINGS } from './constants';

import {
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearchs,
} from '../../../../utils/LocationSearchHelper';

class EmailCampaign extends Component {

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
      loadEmailCampaignAndDeliveryReport,
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
      loadEmailCampaignAndDeliveryReport(organisationId, campaignId, filter);
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
      loadEmailCampaignAndDeliveryReport,
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
        loadEmailCampaignAndDeliveryReport(nextOrganisationId, nextCampaignId, filter);
      }
    }
  }

  componentWillUnmount() {
    this.props.resetEmailCampaign();
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
        <EmailCampaignHeader />
        <EmailCampaignDashboard />
        <Card title={translations.EMAIL_BLASTS} buttons={buttons}>
          <BlastTable />
        </Card>
      </div>
    );
  }

}

EmailCampaign.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
  loadEmailCampaignAndDeliveryReport: PropTypes.func.isRequired,
  fetchAllEmailBlast: PropTypes.func.isRequired,
  fetchAllEmailBlastPerformance: PropTypes.func.isRequired,
  resetEmailCampaign: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  translations: state.translations,
});

const mapDispatchToProps = {
  fetchAllEmailBlast: EmailCampaignActions.fetchAllEmailBlast.request,
  fetchAllEmailBlastPerformance: EmailCampaignActions.fetchAllEmailBlastPerformance.request,
  loadEmailCampaignAndDeliveryReport: EmailCampaignActions.loadEmailCampaignAndDeliveryReport,
  resetEmailCampaign: EmailCampaignActions.resetEmailCampaign,
};

EmailCampaign = connect(
  mapStateToProps,
  mapDispatchToProps,
)(EmailCampaign);

EmailCampaign = withRouter(EmailCampaign);

export default EmailCampaign;

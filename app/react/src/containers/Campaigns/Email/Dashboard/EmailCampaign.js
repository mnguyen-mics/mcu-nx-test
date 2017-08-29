import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';
import { withRouter, Link } from 'react-router-dom';
import { Layout, Button } from 'antd';

import EmailCampaignActionbar from './EmailCampaignActionbar';
import EmailCampaignHeader from './EmailCampaignHeader';
import EmailCampaignDashboard from './EmailCampaignDashboard';
import { Card } from '../../../../components/Card';
import BlastTable from './BlastTable';
import * as EmailCampaignActions from '../../../../state/Campaign/Email/actions';
import messages from './messages';
import {
  getEmailBlastTableView,
  normalizedEmailPerformance,
  getTableDataSource,
} from '../../../../state/Campaign/Email/selectors';

import { EMAIL_DASHBOARD_SEARCH_SETTINGS } from './constants';

import {
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
} from '../../../../utils/LocationSearchHelper';

import EmailCampaignService from '../../../../services/EmailCampaignService';

import * as NotificationActions from '../../../../state/Notifications/actions';

const { Content } = Layout;

class EmailCampaign extends Component {

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
      loadEmailCampaignAndDeliveryReport,
      fetchAllEmailBlast,
      fetchAllEmailBlastPerformance
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
        search
      },
      match: {
        params: {
          campaignId
        }
      },
      history,
      loadEmailCampaignAndDeliveryReport,
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

    if (!compareSearches(search, nextSearch) || campaignId !== nextCampaignId) {
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

  updateBlastStatus = (blastId, nextStatus) => {
    const {
      match: {
        params: {
          campaignId
        }
      },
      updateBlast,
      notifyError,
      notifySuccess,
    } = this.props;

    EmailCampaignService.updateBlast(campaignId, blastId, { status: nextStatus }).then(blast => {
      // reload blast
      updateBlast(blast);
      notifySuccess({
        intlMessage: messages.blastStatusUpdateSuccessMessage,
        intlDescription: messages.blastStatusUpdateSuccessDescription
      });
    }).catch(error => notifyError(error, { intlMessage: messages.blastStatusUpdateFailure }));
  }

  componentWillUnmount() {
    this.props.resetEmailCampaign();
  }

  render() {
    const {
      match: {
        params: { organisationId, campaignId },
      },
      intl: { formatMessage },
      emailBlasts,
      campaign,
      emailExportStats,
      isFetchingEmailBlastsStat,
      isFetchingCampaignStat
    } = this.props;

    const buttons = (
      <Link to={`/v2/o/${organisationId}/campaigns/email/${campaignId}/blasts/create`}>
        <Button type="primary">
          <FormattedMessage id="NEW_EMAIL_BLAST" />
        </Button>
      </Link>
    );

    return (
      <div className="ant-layout">
        <EmailCampaignActionbar
          campaign={campaign}
          campaignStats={emailExportStats}
          archiveCampaign={() => {}}
          isFetchingStats={isFetchingEmailBlastsStat && isFetchingCampaignStat}
          blastsStats={emailBlasts}
        />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <EmailCampaignHeader />
            <EmailCampaignDashboard />
            <Card title={formatMessage(messages.emailBlast)} buttons={buttons}>
              <BlastTable updateBlastStatus={this.updateBlastStatus} />
            </Card>
          </Content>
        </div>
      </div>
    );
  }
}

EmailCampaign.propTypes = {
  intl: intlShape.isRequired,
  match: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
  campaign: PropTypes.shape().isRequired,
  // email campaign
  isFetchingCampaignStat: PropTypes.bool.isRequired,
  resetEmailCampaign: PropTypes.func.isRequired,
  loadEmailCampaignAndDeliveryReport: PropTypes.func.isRequired,
  emailExportStats: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  // email blasts
  isFetchingEmailBlastsStat: PropTypes.bool.isRequired,
  fetchAllEmailBlast: PropTypes.func.isRequired,
  fetchAllEmailBlastPerformance: PropTypes.func.isRequired,
  emailBlasts: PropTypes.arrayOf(PropTypes.object).isRequired,
  updateBlast: PropTypes.func.isRequired,
  notifyError: PropTypes.func.isRequired,
  notifySuccess: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
  fetchAllEmailBlast: EmailCampaignActions.fetchAllEmailBlast.request,
  fetchAllEmailBlastPerformance: EmailCampaignActions.fetchAllEmailBlastPerformance.request,
  loadEmailCampaignAndDeliveryReport: EmailCampaignActions.loadEmailCampaignAndDeliveryReport,
  resetEmailCampaign: EmailCampaignActions.resetEmailCampaign,
  updateBlast: EmailCampaignActions.updateBlast,
  notifyError: NotificationActions.notifyError,
  notifySuccess: NotificationActions.notifySuccess,
};

const mapStateToProps = state => ({
  campaign: state.emailCampaignSingle.emailCampaignApi.emailCampaign,
  emailBlasts: getEmailBlastTableView(state),
  emailCampaignStats: normalizedEmailPerformance(state),
  emailExportStats: getTableDataSource(state),
  isFetchingEmailBlastsStat: state.emailCampaignSingle.emailBlastPerformance.isFetching,
  isFetchingCampaignStat: state.emailCampaignSingle.emailCampaignPerformance.isFetching
});

EmailCampaign = compose(
  withRouter,
  injectIntl,
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(EmailCampaign);

export default EmailCampaign;

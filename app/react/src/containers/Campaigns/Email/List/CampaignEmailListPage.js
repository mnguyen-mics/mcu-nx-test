import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Modal } from 'antd';
import { FormattedMessage, intlShape, injectIntl, defineMessages } from 'react-intl';

import CampaignsEmailTable from './CampaignsEmailTable';
import { withMcsRouter } from '../../../Helpers';
import { ReactRouterPropTypes } from '../../../../validators/proptypes';
import {
  updateSearch,
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearchs
} from '../../../../utils/LocationSearchHelper';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import { normalizeReportView } from '../../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';
import { EMAIL_SEARCH_SETTINGS } from './constants';
import CampaignService from '../../../../services/CampaignService';
import ReportService from '../../../../services/ReportService';
import * as notifyActions from '../../../../state/Notifications/actions';

const messages = defineMessages({
  confirmArchiveModalTitle: {
    id: 'campaign.email.archive.confirm_modal.title',
    defaultMessage: 'Are you sure you want to archive this Campaign ?'
  },
  confirmArchiveModalContent: {
    id: 'campaign.email.archive.confirm_modal.content',
    defaultMessage: "By archiving this Campaign all its activities will be suspended. You'll be able to recover it from the archived campaign filter."
  },
  confirmArchiveModalOk: {
    id: 'campaign.email.archive.confirm_modal.ok',
    defaultMessage: 'Archive now'
  },
  confirmArchiveModalCancel: {
    id: 'campaign.email.archive.confirm_modal.cancel',
    defaultMessage: 'Cancel'
  }
});

class CampaignEmailListPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      emailCampaignsById: {},
      deliveryReportByCampaignId: {},
      allCampaignIds: [],
      totalCampaigns: 0,
      isFetchingCampaigns: true,
      isFetchingStats: true,
      noCampaignYet: false
    };
    this.handleArchiveCampaign = this.handleArchiveCampaign.bind(this);
    this.handleEditCampaign = this.handleEditCampaign.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
  }

  componentDidMount() {
    const {
      organisationId,
      location: { search, pathname },
      history
    } = this.props;

    if (!isSearchValid(search, EMAIL_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, EMAIL_SEARCH_SETTINGS),
        state: { reloadDataSource: true }
      });
    } else {
      const filter = parseSearch(search, EMAIL_SEARCH_SETTINGS);
      this.fetchCampaignAndStats(organisationId, filter, true);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      organisationId,
      location: { search },
      history
    } = this.props;

    const {
      organisationId: nextOrganisationId,
      location: { pathname: nextPathname, search: nextSearch, state }
    } = nextProps;


    const checkEmptyDataSource = state && state.reloadDataSource;

    if (!compareSearchs(search, nextSearch) || organisationId !== nextOrganisationId) {
      if (!isSearchValid(nextSearch, EMAIL_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, EMAIL_SEARCH_SETTINGS),
          state: { reloadDataSource: organisationId !== nextOrganisationId }
        });
      } else {
        const filter = parseSearch(nextSearch, EMAIL_SEARCH_SETTINGS);
        this.fetchCampaignAndStats(nextOrganisationId, filter, checkEmptyDataSource);
      }
    }
  }

  handleArchiveCampaign(campaign) {
    const { organisationId, location: { search }, intl: { formatMessage } } = this.props;

    // Modal.confirm({
    //   title: <FormattedMessage {...messages.confirmArchiveModalTitle} />,
    //   content: <FormattedMessage {...messages.confirmArchiveModalContent} />,
    //   iconType: 'exclamation-circle',
    //   okText: formatMessage(messages.confirmArchiveModalOk),
    //   cancelText: formatMessage(messages.confirmArchiveModalCancel),
    //   onOk() {
    //     return CampaignService.archiveEmailCampaign(campaign.id).then(() => {
    //       loadCampaignsEmailDataSource(organisationId, filter);
    //     });
    //   },
    //   onCancel() { },
    // });
  }

  handleEditCampaign(campaign) {
    const { organisationId, history } = this.props;
    history.push(`/v2/o/${organisationId}/campaigns/email/${campaign.id}/edit`);
  }

  handleFilterChange(filter) {
    const {
      history,
      location: { search: currentSearch, pathname }
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, filter, EMAIL_SEARCH_SETTINGS)
    };

    history.push(nextLocation);
  }

  fetchCampaignAndStats(organisationId, filter, checkHasCampaigns = true) {

    const buildGetCampaignsOptions = () => {
      const options = {
        archived: filter.statuses.includes('ARCHIVED'),
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize)
      };

      const apiStatuses = filter.statuses.filter(status => status !== 'ARCHIVED');

      if (filter.keywords) { options.keywords = filter.keywords; }
      if (apiStatuses.length > 0) {
        options.status = apiStatuses;
      }
      return options;
    };

    Promise.all([
      CampaignService.getCampaigns(organisationId, 'EMAIL', buildGetCampaignsOptions()),
      checkHasCampaigns ? CampaignService.getCampaigns(organisationId, 'EMAIL', { ...getPaginatedApiParam(1, 1) }) : Promise.resolve(null)
    ]).then(responses => {
      this.setState({
        isFetchingCampaigns: false,
        noCampaignYet: responses[1] && responses[1].count === 0,
        allCampaignIds: responses[0].data.map(emailCampaign => emailCampaign.id),
        emailCampaignsById: normalizeArrayOfObject(responses[0].data, 'id'),
        totalCampaigns: responses[0].total
      });
    }).catch(error => {
      this.setState({ isFetchingCampaigns: false });
      this.props.notifyError(error);
    });

    ReportService.getEmailDeliveryReport(organisationId, filter.from, filter.to, 'campaign_id').then(response => {
      this.setState({
        isFetchingStats: false,
        deliveryReportByCampaignId: normalizeArrayOfObject(normalizeReportView(response.data.report_view), 'campaign_id')
      });
    }).catch(error => {
      this.setState({ isFetchingStats: false });
      this.props.notifyError(error);
    });

  }

  buildTableDataSource() {
    const {
      emailCampaignsById,
      deliveryReportByCampaignId,
      allCampaignIds
    } = this.state;

    return allCampaignIds.map(campaignId => {
      return {
        ...emailCampaignsById[campaignId],
        ...deliveryReportByCampaignId[campaignId]
      };
    });
  }

  render() {

    const {
      isFetchingCampaigns,
      isFetchingStats,
      totalCampaigns,
      noCampaignYet
    } = this.state;

    const {
      location: { search }
    } = this.props;

    return (
      <CampaignsEmailTable
        dataSource={this.buildTableDataSource()}
        totalCampaigns={totalCampaigns}
        isFetchingCampaigns={isFetchingCampaigns}
        isFetchingStats={isFetchingStats}
        noCampaignYet={noCampaignYet}
        filter={parseSearch(search, EMAIL_SEARCH_SETTINGS)}
        onFilterChange={this.handleFilterChange}
        onArchiveCampaign={this.handleArchiveCampaign}
        onEditCampaign={this.handleEditCampaign}

      />
    );
  }
}

CampaignEmailListPage.defaultProps = {
  notifyError: () => {}
};

CampaignEmailListPage.propTypes = {
  organisationId: PropTypes.string.isRequired,
  location: ReactRouterPropTypes.location.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  notifyError: PropTypes.func,
  intl: intlShape.isRequired
};

export default compose(
  injectIntl,
  withMcsRouter,
  connect(
    undefined,
    { notifyError: notifyActions.notifyError }
  )
)(CampaignEmailListPage);

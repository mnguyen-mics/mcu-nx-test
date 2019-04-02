import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Modal } from 'antd';
import { injectIntl, defineMessages } from 'react-intl';

import EmailCampaignsTable from './EmailCampaignsTable';
import { withMcsRouter } from '../../../Helpers';
import { ReactRouterPropTypes } from '../../../../validators/proptypes';
import {
  updateSearch,
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
} from '../../../../utils/LocationSearchHelper.ts';
import { getPaginatedApiParam, takeLatest } from '../../../../utils/ApiHelper.ts';
import { normalizeReportView } from '../../../../utils/MetricHelper.ts';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer.ts';
import { EMAIL_SEARCH_SETTINGS } from './constants';
import CampaignService from '../../../../services/CampaignService.ts';
import EmailCampaignService from '../../../../services/EmailCampaignService.ts';
import ReportService from '../../../../services/ReportService.ts';
import * as notifyActions from '../../../../state/Notifications/actions';

const messages = defineMessages({
  confirmArchiveModalTitle: {
    id: 'campaign.email.archive.confirm_modal.title',
    defaultMessage: 'Are you sure you want to archive this Campaign ?',
  },
  confirmArchiveModalContent: {
    id: 'campaign.email.archive.confirm_modal.content',
    defaultMessage: "By archiving this Campaign all its activities will be suspended. You'll be able to recover it from the archived campaign filter.",
  },
  confirmArchiveModalOk: {
    id: 'campaign.email.archive.confirm_modal.ok',
    defaultMessage: 'Archive now',
  },
  confirmArchiveModalCancel: {
    id: 'campaign.email.archive.confirm_modal.cancel',
    defaultMessage: 'Cancel',
  },
  fetchReportError: {
    id: 'campaign.email.error.fetch-report',
    defaultMessage: 'Cannot load campaign statistics',
  },
  fetchCampaignError: {
    id: 'campaign.email.error.fetch-campaign',
    defaultMessage: 'Cannot load campaign data',
  },
  filterByLabel: {
    id: 'campaign.email.filterBy.label',
    defaultMessage: 'Filter By Label'
  }
});

const getLatestDeliveryReport = takeLatest(ReportService.getEmailDeliveryReport);

class EmailCampaignListPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      emailCampaignsById: {},
      deliveryReportByCampaignId: {},
      allCampaignIds: [],
      totalCampaigns: 0,
      isFetchingCampaigns: true,
      isFetchingStats: true,
      noCampaignYet: false,
    };
  }

  componentDidMount() {
    const {
      organisationId,
      location: { search, pathname },
      history,
    } = this.props;

    if (!isSearchValid(search, EMAIL_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, EMAIL_SEARCH_SETTINGS),
        state: { reloadDataSource: true },
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
      history,
    } = this.props;

    const {
      organisationId: nextOrganisationId,
      location: { pathname: nextPathname, search: nextSearch, state },
    } = nextProps;


    const checkEmptyDataSource = state && state.reloadDataSource;

    if (!compareSearches(search, nextSearch) || organisationId !== nextOrganisationId) {
      if (!isSearchValid(nextSearch, EMAIL_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, EMAIL_SEARCH_SETTINGS),
          state: { reloadDataSource: organisationId !== nextOrganisationId },
        });
      } else {
        const filter = parseSearch(nextSearch, EMAIL_SEARCH_SETTINGS);
        this.fetchCampaignAndStats(nextOrganisationId, filter, checkEmptyDataSource);
      }
    }
  }

  handleArchiveCampaign = (campaign) => {
    const {
      organisationId,
      location: {
        pathname,
        state,
        search,
      },
      history,
      translations,
    } = this.props;

    const { emailCampaignsById } = this.state;

    const filter = parseSearch(search, EMAIL_SEARCH_SETTINGS);

    const reloadEmailCampaign = () => {
      this.fetchCampaignAndStats(organisationId, filter);
    };

    Modal.confirm({
      title: translations.CAMPAIGN_MODAL_CONFIRM_ARCHIVED_TITLE,
      content: translations.CAMPAIGN_MODAL_CONFIRM_ARCHIVED_BODY,
      iconType: 'exclamation-circle',
      okText: translations.MODAL_CONFIRM_ARCHIVED_OK,
      cancelText: translations.MODAL_CONFIRM_ARCHIVED_CANCEL,
      onOk() {
        EmailCampaignService.deleteEmailCampaign(campaign.id).then(() => {
          if (emailCampaignsById.length === 1 && filter.currentPage !== 1) {
            const newFilter = {
              ...filter,
              currentPage: filter.currentPage - 1,
              automated: true,
            };
            reloadEmailCampaign();
            history.replace({
              pathname: pathname,
              search: updateSearch(search, newFilter),
              state: state
            });
            return Promise.resolve();
          }
          reloadEmailCampaign();
          return Promise.resolve();

        });
      },
      onCancel() { },
    });
  }


  handleEditCampaign = (campaign) => {
    const { organisationId, history } = this.props;
    history.push(`/v2/o/${organisationId}/campaigns/email/${campaign.id}/edit`);
  }

  handleFilterChange = (filter) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, filter, EMAIL_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  }

  fetchCampaignAndStats = (organisationId, filter, checkHasCampaigns = true) => {

    const buildGetCampaignsOptions = () => {
      const options = {
        archived: filter.statuses.includes('ARCHIVED'),
        automated: false,
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };

      const apiStatuses = filter.statuses.filter(status => status !== 'ARCHIVED');

      if (filter.keywords) { options.keywords = filter.keywords; }
      if (filter.label_id.length) { options.label_id = filter.label_id; }
      if (apiStatuses.length > 0) {
        options.status = apiStatuses;
      }
      return options;
    };

    Promise.all([
      CampaignService.getCampaigns(organisationId, 'EMAIL', buildGetCampaignsOptions()),
      checkHasCampaigns ? CampaignService.getCampaigns(organisationId, 'EMAIL', { ...getPaginatedApiParam(1, 1) }) : Promise.resolve(null),
    ]).then(responses => {
      this.setState({
        isFetchingCampaigns: false,
        noCampaignYet: responses[1] && responses[1].count === 0,
        allCampaignIds: responses[0].data.map(emailCampaign => emailCampaign.id),
        emailCampaignsById: normalizeArrayOfObject(responses[0].data, 'id'),
        totalCampaigns: responses[0].total,
      });
    }).catch(error => {
      this.setState({ isFetchingCampaigns: false });
      this.props.notifyError(error, { intlMessage: messages.fetchCampaignError });
    });

    getLatestDeliveryReport(organisationId, filter.from, filter.to, 'campaign_id').then(response => {
      this.setState({
        isFetchingStats: false,
        deliveryReportByCampaignId: normalizeArrayOfObject(normalizeReportView(response.data.report_view), 'campaign_id'),
      });
    }).catch(error => {
      this.setState({ isFetchingStats: false });
      this.props.notifyError(error, { intlMessage: messages.fetchReportError });
    });

  }

  buildTableDataSource = () => {
    const {
      emailCampaignsById,
      deliveryReportByCampaignId,
      allCampaignIds,
    } = this.state;

    return allCampaignIds.map(campaignId => {
      return {
        ...emailCampaignsById[campaignId],
        ...deliveryReportByCampaignId[campaignId],
      };
    });
  }

  render() {

    const {
      isFetchingCampaigns,
      isFetchingStats,
      totalCampaigns,
      noCampaignYet,
    } = this.state;

    const {
      location: { search },
      labels
    } = this.props;

    const filter = parseSearch(search, EMAIL_SEARCH_SETTINGS);

    const labelsOptions = {
      labels: this.props.labels,
      selectedLabels: labels.filter(label => {
        return filter.label_id.find(filteredLabelId => filteredLabelId === label.id) ? true : false;
      }),
      onChange: (newLabels) => {
        const formattedLabels = newLabels.map(label => label.id);
        this.handleFilterChange({ label_id: formattedLabels });
      },
      buttonMessage: messages.filterByLabel
    };

    return (
      <EmailCampaignsTable
        dataSource={this.buildTableDataSource()}
        totalCampaigns={totalCampaigns}
        isFetchingCampaigns={isFetchingCampaigns}
        isFetchingStats={isFetchingStats}
        noCampaignYet={noCampaignYet}
        filter={filter}
        onFilterChange={this.handleFilterChange}
        onArchiveCampaign={this.handleArchiveCampaign}
        onEditCampaign={this.handleEditCampaign}
        labelsOptions={labelsOptions}
      />
    );
  }
}

EmailCampaignListPage.defaultProps = {
  notifyError: () => {},
};

EmailCampaignListPage.propTypes = {
  organisationId: PropTypes.string.isRequired,
  location: ReactRouterPropTypes.location.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  notifyError: PropTypes.func,
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  labels: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  // intl: intlShape.isRequired
};

export default compose(
  injectIntl,
  withMcsRouter,
  connect(
    state => ({
      translations: state.translations,
      labels: state.labels.labelsApi.data,
    })
    ,
    { notifyError: notifyActions.notifyError },
  ),
)(EmailCampaignListPage);

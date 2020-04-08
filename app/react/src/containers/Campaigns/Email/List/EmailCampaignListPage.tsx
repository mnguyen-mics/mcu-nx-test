import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import EmailCampaignsTable from './EmailCampaignsTable';
import {
  updateSearch,
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
  DateSearchSettings,
  PaginationSearchSettings,
  KeywordSearchSettings,
  LabelsSearchSettings,
} from '../../../../utils/LocationSearchHelper';
import { getPaginatedApiParam, takeLatest } from '../../../../utils/ApiHelper';
import { normalizeReportView } from '../../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';
import { EMAIL_SEARCH_SETTINGS } from './constants';
import ReportService from '../../../../services/ReportService';
import * as notifyActions from '../../../../redux/Notifications/actions';
import { RouteComponentProps, withRouter } from 'react-router';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { CampaignStatus } from '../../../../models/campaign/constants';
import { Index } from '../../../../utils';
import { messages } from './messages';
import { CampaignsOptions } from '../../../../services/DisplayCampaignService';
import { Modal } from 'antd';
import { EmailCampaignResourceWithStats } from '../../../../models/campaign/email/EmailCampaignResource';
import { MicsReduxState } from '../../../../utils/ReduxHelper';
import { Label } from '../../../Labels/Labels';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IEmailCampaignService } from '../../../../services/EmailCampaignService';

const getLatestDeliveryReport = takeLatest(
  ReportService.getEmailDeliveryReport,
);

export interface FilterParams
  extends DateSearchSettings,
    PaginationSearchSettings,
    KeywordSearchSettings,
    LabelsSearchSettings {
  statuses: CampaignStatus[];
}
interface State {
  emailCampaignsById: Index<EmailCampaignResourceWithStats>;
  isFetchingCampaigns: boolean;
  isFetchingStats: boolean;
  deliveryReportByCampaignId: { [key: string]: EmailCampaignResourceWithStats };
  allCampaignIds: string[];
  totalCampaigns: number;
  hasEmailCampaigns: boolean;
}

interface MapDispatchToProps {
  labels: Label[];
}

type Props = RouteComponentProps<{
  organisationId: string;
}> &
  MapDispatchToProps &
  InjectedIntlProps &
  InjectedNotificationProps;

class EmailCampaignListPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IEmailCampaignService)
  private _emailCampaignService: IEmailCampaignService;

  constructor(props: Props) {
    super(props);
    this.state = {
      emailCampaignsById: {},
      deliveryReportByCampaignId: {},
      allCampaignIds: [],
      totalCampaigns: 0,
      isFetchingCampaigns: true,
      isFetchingStats: true,
      hasEmailCampaigns: true,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId },
      },
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

  componentWillReceiveProps(nextProps: Props) {
    const {
      match: {
        params: { organisationId },
      },
      location: { search },
      history,
    } = this.props;

    const {
      match: {
        params: { organisationId: nextOrganisationId },
      },

      location: { pathname: nextPathname, search: nextSearch },
    } = nextProps;

    if (
      !compareSearches(search, nextSearch) ||
      organisationId !== nextOrganisationId
    ) {
      if (!isSearchValid(nextSearch, EMAIL_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, EMAIL_SEARCH_SETTINGS),
          state: { reloadDataSource: organisationId !== nextOrganisationId },
        });
      } else {
        const filter = parseSearch(nextSearch, EMAIL_SEARCH_SETTINGS);
        this.fetchCampaignAndStats(nextOrganisationId, filter);
      }
    }
  }

  handleArchiveCampaign = (campaign: EmailCampaignResourceWithStats) => {
    const {
      match: {
        params: { organisationId },
      },
      location: { pathname, state, search },
      history,
      intl,
    } = this.props;

    const filter = parseSearch(search, EMAIL_SEARCH_SETTINGS);

    const reloadEmailCampaign = () => {
      this.fetchCampaignAndStats(organisationId, filter);
    };

    const dataSource = this.buildTableDataSource();

    const deleteEmailCampaign = () => {
      return this._emailCampaignService.deleteEmailCampaign(campaign.id);
    };

    Modal.confirm({
      title: intl.formatMessage(messages.confirmArchiveModalTitle),
      content: intl.formatMessage(messages.confirmArchiveModalContent),
      iconType: 'exclamation-circle',
      okText: intl.formatMessage(messages.confirmArchiveModalOk),
      cancelText: intl.formatMessage(messages.confirmArchiveModalCancel),
      onOk() {
        deleteEmailCampaign().then(() => {
          if (dataSource.length === 1 && filter.currentPage !== 1) {
            const newFilter = {
              ...filter,
              currentPage: filter.currentPage - 1,
              automated: true,
            };
            reloadEmailCampaign();
            history.replace({
              pathname: pathname,
              search: updateSearch(search, newFilter),
              state: state,
            });
          }
          reloadEmailCampaign();
        });
      },
      onCancel() {
        //
      },
    });
  };

  handleFilterChange = (filter: Index<any>) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, filter, EMAIL_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  };

  fetchCampaignAndStats = (
    organisationId: string,
    filter: Index<any>,
    init: boolean = false,
  ) => {
    const buildGetCampaignsOptions = () => {
      const options: CampaignsOptions = {
        archived: filter.statuses.includes('ARCHIVED'),
        automated: false,
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };

      const apiStatuses = filter.statuses.filter(
        (status: string) => status !== 'ARCHIVED',
      );

      if (filter.keywords) {
        options.keywords = filter.keywords;
      }
      if (filter.label_id.length > 0) {
        options.label_id = filter.label_id;
      }
      if (apiStatuses.length > 0) {
        options.status = apiStatuses;
      }
      return init
        ? {
            ...getPaginatedApiParam(1, 10),
          }
        : options;
    };
    this._emailCampaignService
      .getEmailCampaigns(organisationId, 'EMAIL', buildGetCampaignsOptions())
      .then(response => {
        this.setState({
          isFetchingCampaigns: false,
          allCampaignIds: response.data.map(emailCampaign => emailCampaign.id),
          emailCampaignsById: normalizeArrayOfObject(response.data, 'id'),
          totalCampaigns: response.total || 0,
          hasEmailCampaigns: init ? response.count !== 0 : true,
        });
      })
      .catch(error => {
        this.setState({ isFetchingCampaigns: false });
        this.props.notifyError(error, {
          intlMessage: messages.fetchCampaignError,
        });
      });

    getLatestDeliveryReport(
      organisationId,
      filter.from,
      filter.to,
      'campaign_id',
    )
      .then(response => {
        this.setState({
          isFetchingStats: false,
          deliveryReportByCampaignId: normalizeArrayOfObject(
            normalizeReportView(response.data.report_view),
            'campaign_id' as any,
          ),
        });
      })
      .catch(error => {
        this.setState({ isFetchingStats: false });
        this.props.notifyError(error, {
          intlMessage: messages.fetchReportError,
        });
      });
  };

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
  };

  render() {
    const {
      isFetchingCampaigns,
      isFetchingStats,
      totalCampaigns,
      hasEmailCampaigns,
    } = this.state;

    const {
      location: { search },
      labels,
    } = this.props;

    const filter = parseSearch(search, EMAIL_SEARCH_SETTINGS);

    const labelsOptions = {
      labels: this.props.labels,
      selectedLabels: labels.filter(label => {
        return filter.label_id.find(
          (filteredLabelId: string) => filteredLabelId === label.id,
        )
          ? true
          : false;
      }),
      onChange: (newLabels: Label[]) => {
        const formattedLabels = newLabels.map(label => label.id);
        this.handleFilterChange({ label_id: formattedLabels });
      },
      buttonMessage: messages.filterByLabel,
    };

    return (
      <EmailCampaignsTable
        dataSource={this.buildTableDataSource()}
        archiveCampaign={this.handleArchiveCampaign}
        hasEmailCampaigns={hasEmailCampaigns}
        totalCampaigns={totalCampaigns}
        isFetchingCampaigns={isFetchingCampaigns}
        isFetchingStats={isFetchingStats}
        filter={filter}
        onFilterChange={this.handleFilterChange}
        labelsOptions={labelsOptions}
      />
    );
  }
}

export default compose(
  injectIntl,
  withRouter,
  injectNotifications,
  connect(
    (state: MicsReduxState) => ({
      labels: state.labels.labelsApi.data,
    }),
    { notifyError: notifyActions.notifyError },
  ),
)(EmailCampaignListPage);

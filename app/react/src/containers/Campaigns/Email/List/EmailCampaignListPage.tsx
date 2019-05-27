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
import CampaignService, {
  GetCampaignsOptions,
} from '../../../../services/CampaignService';
import ReportService from '../../../../services/ReportService';
import * as notifyActions from '../../../../state/Notifications/actions';
import { RouteComponentProps, withRouter } from 'react-router';
import { Label } from '../../../../components/LabelsSelector';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { CampaignStatus } from '../../../../models/campaign/constants';
import { Index } from '../../../../utils';
import { messages } from './messages';
import { CampaignResource } from '../../../../models/campaign/CampaignResource';

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
  emailCampaignsById: Index<CampaignResource>;
  isFetchingCampaigns: boolean;
  isFetchingStats: boolean;
  deliveryReportByCampaignId: { [key: string]: CampaignResource };
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
  constructor(props: Props) {
    super(props);
    this.state = {
      emailCampaignsById: {},
      deliveryReportByCampaignId: {},
      allCampaignIds: [],
      totalCampaigns: 0,
      isFetchingCampaigns: true,
      isFetchingStats: true,
      hasEmailCampaigns: false,
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
      const options: GetCampaignsOptions = {
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
    CampaignService.getCampaigns(
      organisationId,
      'EMAIL',
      buildGetCampaignsOptions(),
    )
      .then(response => {
        this.setState({
          isFetchingCampaigns: false,
          allCampaignIds: response.data.map(emailCampaign => emailCampaign.id),
          emailCampaignsById: normalizeArrayOfObject(response.data, 'id'),
          totalCampaigns: response.total || 0,
          hasEmailCampaigns: init ? response.count === 0 : false,
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
            'campaign_id',
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
        fetchCampaignAndStats={this.fetchCampaignAndStats}
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
    (state: any) => ({
      labels: state.labels.labelsApi.data,
    }),
    { notifyError: notifyActions.notifyError },
  ),
)(EmailCampaignListPage);

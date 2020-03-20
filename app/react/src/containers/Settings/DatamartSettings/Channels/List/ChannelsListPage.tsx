import * as React from 'react';
import { Row, Button, Layout, Icon, Modal } from 'antd';
import { InjectedIntlProps, injectIntl, FormattedMessage } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { MicsReduxState } from '../../../../../utils/ReduxHelper';
import { getWorkspace } from '../../../../../state/Session/selectors';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import {
  ChannelType,
  ChannelResourceShape,
  ChannelAnalyticsResource,
  ChannelResourceShapeWithAnalytics,
} from '../../../../../models/settings/settings';
import { UserWorkspaceResource } from '../../../../../models/directory/UserProfileResource';
import {
  FixedChannelFilter,
  ChannelFilter,
  ChannelTypeItem,
  TYPE_SEARCH_SETTINGS,
} from './domain';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IChannelService } from '../../../../../services/ChannelService';
import { MultiSelectProps } from '../../../../../components/MultiSelect';
import { Link } from 'react-router-dom';
import messages from './messages';
import ChannelsTable from './ChannelsTable';
import {
  updateSearch,
  KEYWORD_SEARCH_SETTINGS,
  DATAMART_SEARCH_SETTINGS,
  PAGINATION_SEARCH_SETTINGS,
  compareSearches,
  parseSearch,
} from '../../../../../utils/LocationSearchHelper';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { DataResponse } from '../../../../../services/ApiService';
import { IDatamartUsersAnalyticsService } from '../../../../../services/DatamartUsersAnalyticsService';
import { uniq, flatten } from 'lodash';
import McsMoment from '../../../../../utils/McsMoment';
import { normalizeReportView } from '../../../../../utils/MetricHelper';
import {
  DatamartUsersAnalyticsMetric,
  DatamartUsersAnalyticsDimension,
} from '../../../../../utils/DatamartUsersAnalyticsReportHelper';
import { DimensionFilterClause } from '../../../../../models/ReportRequestBody';

const { Content } = Layout;

interface ChannelsListPageProps {
  fixedFilterOpt?: FixedChannelFilter;
}

interface ChannelsListPageState {
  channels: ChannelResourceShape[];
  totalChannels: number;
  isFetchingChannels: boolean;
  noChannelYet: boolean;
  filter: ChannelFilter;
}

interface MapStateToProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

type Props = ChannelsListPageProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedIntlProps &
  MapStateToProps &
  InjectedNotificationProps;

class ChannelsListPage extends React.Component<Props, ChannelsListPageState> {
  @lazyInject(TYPES.IChannelService)
  private _channelService: IChannelService;

  @lazyInject(TYPES.IDatamartUsersAnalyticsService)
  private _datamartUsersAnalyticsService: IDatamartUsersAnalyticsService;

  constructor(props: Props) {
    super(props);

    this.state = {
      channels: [],
      totalChannels: 0,
      isFetchingChannels: true,
      noChannelYet: false,
      filter: {
        currentPage: 1,
        pageSize: 10,
        keywords: '',
        type: [],
      },
    };
  }

  computeFilter = (search: string): ChannelFilter => {
    const parsedFilter = parseSearch(search, this.getSearchSettings());
    const filter: ChannelFilter = {
      currentPage: parsedFilter.currentPage ? parsedFilter.currentPage : 1,
      pageSize: parsedFilter.pageSize ? parsedFilter.pageSize : 10,
      keywords: parsedFilter.keywords ? parsedFilter.keywords : '',
      datamartId: parsedFilter.datamartId,
      type: parsedFilter.type,
    };

    return filter;
  };

  getSearchSettings() {
    return [
      ...KEYWORD_SEARCH_SETTINGS,
      ...DATAMART_SEARCH_SETTINGS,
      ...PAGINATION_SEARCH_SETTINGS,
      ...TYPE_SEARCH_SETTINGS,
    ];
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId },
      },
      fixedFilterOpt,
    } = this.props;

    const { filter } = this.state;

    this.fetchChannels(organisationId, filter, fixedFilterOpt);
  }

  componentDidUpdate(previousProps: Props) {
    const {
      match: {
        params: { organisationId },
      },
      location: { search },
      fixedFilterOpt,
    } = this.props;

    const {
      match: {
        params: { organisationId: previousOrganisationId },
      },
      location: { search: previousSearch },
      fixedFilterOpt: previousFixedFilterOpt,
    } = previousProps;

    if (fixedFilterOpt !== previousFixedFilterOpt && fixedFilterOpt) {
      const { filter } = this.state;
      this.fetchChannels(organisationId, filter, fixedFilterOpt);
    } else if (
      organisationId !== previousOrganisationId ||
      !compareSearches(search, previousSearch)
    ) {
      const computedFilter: ChannelFilter = this.computeFilter(search);
      this.setState({ filter: computedFilter }, () => {
        this.fetchChannels(organisationId, computedFilter);
      });
    }
  }

  fetchChannels = (
    organisationId: string,
    filter: ChannelFilter,
    fixedFilterOpt?: FixedChannelFilter,
  ) => {
    const { notifyError } = this.props;
    const buildGetChannelsOptions = () => {
      const filterType =
        filter.type && filter.type.length === 1 ? filter.type[0] : undefined;

      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
        channel_type: fixedFilterOpt ? fixedFilterOpt.channelType : filterType,
      };
      if (filter.keywords) {
        return {
          ...options,
          keywords: filter.keywords,
        };
      }
      return options;
    };

    this.setState({ isFetchingChannels: true }, () => {
      this._channelService
        .getChannelsByOrganisation(organisationId, buildGetChannelsOptions())
        .then(response => {

          this.setState({
            channels: response.data,
            totalChannels: response.total ? response.total : response.count,
          });

          const datamartIds = uniq(
            response.data.map(channel => channel.datamart_id),
          );
          const metrics: DatamartUsersAnalyticsMetric[] = ['sessions', 'users'];
          const from = new McsMoment('now-8d');
          const to = new McsMoment('now-1d');
          const dimensions: DatamartUsersAnalyticsDimension[] = ['channel_id'];
          const dimensionFilterClauses: DimensionFilterClause = {
            operator: 'OR',
            filters: [
              {
                dimension_name: 'type',
                not: false,
                operator: 'IN_LIST',
                expressions: ['SITE_VISIT', 'APP_VISIT'],
                case_sensitive: false,
              },
            ],
          };

          Promise.all(
            datamartIds.map(datamartId => {
              return this._datamartUsersAnalyticsService.getAnalytics(
                datamartId,
                metrics,
                from,
                to,
                dimensions,
                dimensionFilterClauses,
              );
            }),
          )
            .then(table => {
              const analyticsByChannel = flatten(
                table.map(t =>
                  normalizeReportView<ChannelAnalyticsResource>(
                    t.data.report_view,
                  ),
                ),
              );
              const channelsWithAnalytics: ChannelResourceShapeWithAnalytics[] = response.data.map(
                channelRes => {
                  const analytics = analyticsByChannel.find(
                    analyticsItem =>
                      analyticsItem.channel_id !== undefined &&
                      analyticsItem.channel_id.toString() === channelRes.id,
                  );
                  if (analytics) {
                    return { ...channelRes, ...analytics };
                  } else return channelRes;
                },
              );
              this.setState({
                channels: channelsWithAnalytics,
                totalChannels: response.total ? response.total : response.count,
                isFetchingChannels: false,
              });
            })
            .catch(err => {
              this.setState({isFetchingChannels: false });
              notifyError(err);
            });
        })
        .catch(err => {
          this.setState({ isFetchingChannels: false });
          notifyError(err);
        });
    });
  };

  handleEditChannel = (channel: ChannelResourceShapeWithAnalytics) => {
    const {
      match: {
        params: { organisationId },
      },
      location,
      history,
    } = this.props;

    const channelTypeInUrl = this.getChannelTypeInUrl(channel.type);

    history.push({
      pathname: `/v2/o/${organisationId}/settings/datamart/${channel.datamart_id}/${channelTypeInUrl}/${channel.id}/edit`,
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  handleDeleteChannel = (channel: ChannelResourceShape) => {
    const {
      match: {
        params: { organisationId },
      },
      location,
      history,
      intl: { formatMessage },
      notifyError,
    } = this.props;

    Modal.confirm({
      iconType: 'exclamation-circle',
      title: formatMessage(messages.deleteChannelModalTitle),
      okText: formatMessage(messages.deleteChannelModalOk),
      cancelText: formatMessage(messages.deleteChannelModalCancel),
      onOk: () => {
        const deletePromise: Promise<DataResponse<ChannelResourceShape>> =
          channel.type === 'SITE'
            ? this._channelService.deleteSite(channel.datamart_id, channel.id)
            : this._channelService.deleteMobileApplication(
                channel.datamart_id,
                channel.id,
              );

        deletePromise
          .then((dataResponseChannel: DataResponse<ChannelResourceShape>) => {
            history.push({
              pathname: `/v2/o/${organisationId}/settings/datamart/channels`,
              state: { from: `${location.pathname}${location.search}` },
            });
          })
          .catch(err => {
            notifyError(err);
          });
      },
      onCancel: () => {
        // cancel,
      },
    });
  };

  getChannelTypeInUrl = (channelType: ChannelType): string => {
    return channelType.toLowerCase() + (channelType === 'SITE' ? 's' : '');
  };

  buildNewActionElement = (
    organisationId: string,
    channelType: ChannelType,
  ) => {
    const channelTypeInUrl = this.getChannelTypeInUrl(channelType);

    const url = `/v2/o/${organisationId}/settings/datamart/${channelTypeInUrl}/create`;

    const message =
      channelType === 'SITE' ? messages.newSite : messages.newMobileApplication;

    return (
      <span className="mcs-card-button-left-margin">
        <Link key={message.id} to={url}>
          <Button key={message.id} type="primary">
            <FormattedMessage {...message} />
          </Button>
        </Link>
      </span>
    );
  };

  handleFilterChange = (newFilter: ChannelFilter) => {
    const {
      match: {
        params: { organisationId },
      },
      fixedFilterOpt,
    } = this.props;

    const { filter } = this.state;

    const newFilterType = newFilter.type ? newFilter.type : filter.type;

    const computedFilter: ChannelFilter = {
      ...newFilter,
      type: fixedFilterOpt ? [fixedFilterOpt.channelType] : newFilterType,
    };

    this.setState({ filter: computedFilter }, () => {
      if (fixedFilterOpt) {
        this.fetchChannels(organisationId, computedFilter, fixedFilterOpt);
      } else {
        this.updateLocationSearch(computedFilter);
      }
    });
  };

  updateLocationSearch = (params: Partial<ChannelFilter>) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, this.getSearchSettings()),
    };

    history.push(nextLocation);
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      fixedFilterOpt,
    } = this.props;

    const {
      isFetchingChannels,
      totalChannels,
      channels,
      noChannelYet,
      filter,
    } = this.state;

    const newSiteButton = this.buildNewActionElement(organisationId, 'SITE');
    const newMobileApplicationButton = this.buildNewActionElement(
      organisationId,
      'MOBILE_APPLICATION',
    );

    const newButtonsList = [newSiteButton, newMobileApplicationButton];

    const filtersOptions: Array<MultiSelectProps<any>> = [];

    const channelTypeItems: ChannelTypeItem[] = [
      { key: 'SITE', value: 'Sites' },
      { key: 'MOBILE_APPLICATION', value: 'Mobile Applications' },
    ];

    const filterChannelType: MultiSelectProps<ChannelTypeItem> = {
      displayElement: (
        <div>
          <FormattedMessage {...messages.channelType} />
          <Icon type="down" />
        </div>
      ),
      selectedItems: channelTypeItems.filter(channelTypeItem =>
        filter.type.includes(channelTypeItem.key),
      ),
      items: channelTypeItems,
      singleSelectOnly: false,
      getKey: (item: ChannelTypeItem) => item.key,
      display: (item: ChannelTypeItem) => item.value,
      handleMenuClick: (items: ChannelTypeItem[]) => {
        this.updateLocationSearch({
          type: items.map(i => i.key),
          currentPage: 1,
        });
      },
    };

    if (!fixedFilterOpt) {
      filtersOptions.push(filterChannelType);
    }

    return (
      <div className="ant-layout">
        <Content className="mcs-content-container">
          <Row className="mcs-table-container">
            <div>
              <div className="mcs-card-header mcs-card-title">
                <span className="mcs-card-title">
                  <FormattedMessage {...messages.channels} />
                </span>
                <span className="mcs-card-button">{newButtonsList}</span>
              </div>
              <hr className="mcs-separator" />
              <ChannelsTable
                dataSource={channels}
                totalChannels={totalChannels}
                isFetchingChannels={isFetchingChannels}
                noChannelYet={noChannelYet}
                filter={filter}
                onFilterChange={this.handleFilterChange}
                onDeleteChannel={this.handleDeleteChannel}
                onEditChannel={this.handleEditChannel}
                filtersOptions={filtersOptions}
              />
            </div>
          </Row>
        </Content>
      </div>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  workspace: getWorkspace(state),
});

export default compose<Props, ChannelsListPageProps>(
  withRouter,
  injectIntl,
  injectNotifications,
  connect(mapStateToProps),
)(ChannelsListPage);

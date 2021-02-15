import * as React from 'react';
import { DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Row, Button, Layout, Modal, Menu, Dropdown } from 'antd';
import { InjectedIntlProps, injectIntl, FormattedMessage } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { MicsReduxState } from '../../../../../utils/ReduxHelper';
import { getWorkspace } from '../../../../../redux/Session/selectors';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import {
  ChannelType,
  ChannelResourceShape,
  ChannelAnalyticsResource,
  ChannelResourceShapeWithAnalytics,
} from '../../../../../models/settings/settings';
import { UserWorkspaceResource } from '../../../../../models/directory/UserProfileResource';
import { ChannelFilter, ChannelTypeItem, TYPE_SEARCH_SETTINGS } from './domain';
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
import { flatten } from 'lodash';
import McsMoment from '../../../../../utils/McsMoment';
import { normalizeReportView } from '../../../../../utils/MetricHelper';
import {
  DatamartUsersAnalyticsMetric,
  DatamartUsersAnalyticsDimension,
} from '../../../../../utils/DatamartUsersAnalyticsReportHelper';
import { DimensionFilterClause } from '../../../../../models/ReportRequestBody';
import { IDatamartService } from '../../../../../services/DatamartService';

const { Content } = Layout;

interface ChannelsWithTotal {
  channels: ChannelResourceShape[];
  total: number;
}

interface ChannelsListPageProps {
  fixedDatamartOpt?: string;
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

  @lazyInject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;

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
        types: [],
      },
    };
  }

  computeFilter = (
    search: string,
    fixedDatamartOpt: string | undefined,
  ): ChannelFilter => {
    if (!fixedDatamartOpt) {
      const parsedFilter = parseSearch(search, this.getSearchSettings());
      const computedFilter: ChannelFilter = {
        currentPage: parsedFilter.currentPage ? parsedFilter.currentPage : 1,
        pageSize: parsedFilter.pageSize ? parsedFilter.pageSize : 10,
        keywords: parsedFilter.keywords ? parsedFilter.keywords : '',
        datamartId: parsedFilter.datamartId,
        types: parsedFilter.types ? parsedFilter.types : [],
      };

      return computedFilter;
    } else {
      const { filter } = this.state;

      const computedFilter: ChannelFilter = {
        currentPage: filter.currentPage,
        pageSize: filter.pageSize,
        keywords: filter.keywords,
        datamartId: fixedDatamartOpt,
        types: filter.types,
      };
      return computedFilter;
    }
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
      location: { search },
      fixedDatamartOpt,
    } = this.props;

    const computedFilter: ChannelFilter = this.computeFilter(
      search,
      fixedDatamartOpt,
    );

    this.fetchChannels(organisationId, computedFilter);
  }

  componentDidUpdate(
    previousProps: Props,
    previousState: ChannelsListPageState,
  ) {
    const {
      match: {
        params: { organisationId },
      },
      location: { search },
      fixedDatamartOpt,
    } = this.props;

    const {
      match: {
        params: { organisationId: previousOrganisationId },
      },
      location: { search: previousSearch },
      fixedDatamartOpt: previousFixedDatamartOpt,
    } = previousProps;

    const { filter, isFetchingChannels } = this.state;

    const { filter: previousFilter } = previousState;

    if (
      (organisationId !== previousOrganisationId ||
        !compareSearches(search, previousSearch) ||
        !this.compareFilters(filter, previousFilter) ||
        fixedDatamartOpt !== previousFixedDatamartOpt) &&
      !isFetchingChannels
    ) {
      const computedFilter: ChannelFilter = this.computeFilter(
        search,
        fixedDatamartOpt,
      );
      this.fetchChannels(organisationId, computedFilter);
    }
  }

  compareFilters = (
    filter: ChannelFilter,
    previousFilter: ChannelFilter,
  ): boolean => {
    const comparedTypes =
      filter.types.every(type => previousFilter.types.includes(type)) &&
      filter.types.length === previousFilter.types.length;

    return (
      comparedTypes &&
      filter.currentPage === previousFilter.currentPage &&
      filter.datamartId === previousFilter.datamartId &&
      filter.keywords === previousFilter.keywords &&
      filter.pageSize === previousFilter.pageSize
    );
  };

  fetchChannels = (organisationId: string, filter: ChannelFilter) => {
    const { notifyError } = this.props;
    const buildChannelsOptions = () => {
      const filterType =
        filter.types && filter.types.length === 1 ? filter.types[0] : undefined;

      return {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
        channel_type: filterType,
        keywords: filter.keywords,
        datamart_id: filter.datamartId,
      };
    };

    this.setState({ isFetchingChannels: true }, () => {
      const channelsPromise = this._channelService
        .getChannelsByOrganisation(organisationId, buildChannelsOptions())
        .then(responseChannels => {
          const channelsWithTotal: ChannelsWithTotal = {
            channels: responseChannels.data,
            total: responseChannels.total
              ? responseChannels.total
              : responseChannels.count,
          };
          return channelsWithTotal;
        })
        .catch(err => {
          notifyError(err);
          const emptyChannels: ChannelsWithTotal = {
            channels: [],
            total: 0,
          };
          return emptyChannels;
        });

      const analyticsPromise = this._datamartService
        .getDatamarts(organisationId, {
          allow_administrator: true,
          archived: false,
        })
        .then(datamartsResponse => {
          const datamartIds = datamartsResponse.data.map(_ => _.id);

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

          return Promise.all(
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
          ).then(table => {
            const analyticsByChannel = flatten(
              table.map(t =>
                normalizeReportView<ChannelAnalyticsResource>(
                  t.data.report_view,
                ),
              ),
            );
            return analyticsByChannel;
          });
        })
        .catch(err => {
          notifyError(err);
          const emptyChannelAnalytics: ChannelAnalyticsResource[] = [];
          return emptyChannelAnalytics;
        });

      Promise.all([channelsPromise, analyticsPromise])
        .then(resPromises => {
          const channelsWithTotal = resPromises[0];
          const analyticsByChannel = resPromises[1];

          const { channels, total } = channelsWithTotal;

          const channelsWithAnalytics: ChannelResourceShapeWithAnalytics[] = channels.map(
            channel => {
              const analytics = analyticsByChannel.find(
                analyticsItem =>
                  analyticsItem.channel_id &&
                  analyticsItem.channel_id.toString() === channel.id,
              );

              return { ...channel, ...analytics };
            },
          );

          this.setState({
            isFetchingChannels: false,
            channels: channelsWithAnalytics,
            totalChannels: total,
          });
        })
        .catch(err => {
          notifyError(err);
          this.setState({
            isFetchingChannels: false,
            channels: [],
            totalChannels: 0,
          });
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
      icon: <ExclamationCircleOutlined />,
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
      <Link key={message.id} to={url}>
        <FormattedMessage {...message} />
      </Link>
    );
  };

  handlePartialFilterChange = (partialFilter: Partial<ChannelFilter>) => {
    const {
      location: { search },
      fixedDatamartOpt,
    } = this.props;

    const computedFilter = this.computeFilter(search, fixedDatamartOpt);

    const newFilter: ChannelFilter = { ...computedFilter, ...partialFilter };

    if (!fixedDatamartOpt) {
      this.updateLocationSearch(newFilter);
    } else {
      this.setState({ filter: newFilter });
    }
  };

  updateLocationSearch = (filter: ChannelFilter) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, filter, this.getSearchSettings()),
    };

    history.push(nextLocation);
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      location: { search },
      fixedDatamartOpt,
    } = this.props;

    const {
      isFetchingChannels,
      totalChannels,
      channels,
      noChannelYet,
    } = this.state;

    const computedFilter = this.computeFilter(search, fixedDatamartOpt);

    const menu = (
      <Menu>
        <Menu.Item>
          {this.buildNewActionElement(organisationId, 'SITE')}
        </Menu.Item>
        <Menu.Item>
          {this.buildNewActionElement(organisationId, 'MOBILE_APPLICATION')}
        </Menu.Item>
      </Menu>
    );

    const dropdownButton = (
      <Dropdown overlay={menu} trigger={['click']}>
        <Button type="primary">
          <FormattedMessage {...messages.newChannel} />
          <DownOutlined />
        </Button>
      </Dropdown>
    );

    const newButtonsList = [dropdownButton];

    const channelTypeItems: ChannelTypeItem[] = [
      { key: 'SITE', value: 'Sites' },
      {
        key: 'MOBILE_APPLICATION',
        value: 'Mobile Applications',
      },
    ];

    const filterChannelType: MultiSelectProps<ChannelTypeItem> = {
      displayElement: (
        <div>
          <FormattedMessage {...messages.channelType} />
          <DownOutlined />
        </div>
      ),
      selectedItems: channelTypeItems.filter(channelTypeItem =>
        computedFilter.types.includes(channelTypeItem.key),
      ),
      items: channelTypeItems,
      singleSelectOnly: false,
      getKey: (item: ChannelTypeItem) => item.key,
      display: (item: ChannelTypeItem) => item.value,
      handleMenuClick: (items: ChannelTypeItem[]) => {
        const partialFilter: Partial<ChannelFilter> = {
          currentPage: 1,
          types: items.map(i => i.key),
        };
        this.handlePartialFilterChange(partialFilter);
      },
    };

    const filtersOptions: Array<MultiSelectProps<any>> = [filterChannelType];

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
                filter={computedFilter}
                onFilterChange={this.handlePartialFilterChange}
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

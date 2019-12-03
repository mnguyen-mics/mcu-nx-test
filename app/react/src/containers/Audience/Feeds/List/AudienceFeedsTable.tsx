import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import {
  InjectedIntlProps,
  injectIntl,
  defineMessages,
  FormattedMessage,
} from 'react-intl';
import { compose } from 'recompose';
import { TableViewFilters } from '../../../../components/TableView';
import {
  parseSearch,
  updateSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
} from '../../../../utils/LocationSearchHelper';
import { Index } from '../../../../utils';
import { FEEDS_SEARCH_SETTINGS } from './constants';
import {
  AudienceExternalFeed,
  PluginResource,
  Status,
  PluginType,
} from '../../../../models/Plugins';
import { DataColumnDefinition } from '../../../../components/TableView/TableView';
import AudienceSegmentFeedService, {
  AudienceFeedType,
} from '../../../../services/AudienceSegmentFeedService';
import { MultiSelectProps } from '../../../../components/MultiSelect';
import { Icon, Tooltip } from 'antd';
import PluginService from '../../../../services/PluginService';
import { AudienceSegmentResource } from '../../../../models/audiencesegment/AudienceSegmentResource';
import { lazyInject } from '../../../../config/inversify.config';
import { IAudienceSegmentService } from '../../../../services/AudienceSegmentService';
import { TYPES } from '../../../../constants/types';
import { Link } from 'react-router-dom';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import { McsIcon } from '../../../../components';

type AudienceFeedsTableProps = { feedType: AudienceFeedType };

type Props = AudienceFeedsTableProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedIntlProps;

interface State {
  list: {
    feeds: Array<{
      feed: AudienceExternalFeed;
      audienceSegment?: AudienceSegmentResource;
    }>;
    total: number;
    isLoading: boolean;
  };
  plugins: PluginResource[];
}

const messages = defineMessages({
  name: {
    id: 'audience.feeds.list.column.name',
    defaultMessage: 'Name',
  },
  segmentName: {
    id: 'audience.feeds.list.column.segmentName',
    defaultMessage: 'Segment Name',
  },
  segmentNameNotFound: {
    id: 'audience.feeds.list.column.segmentNameNotFound',
    defaultMessage: 'Untitled',
  },
  segmentDeleted: {
    id: 'audience.feeds.list.column.segmentDeleted',
    defaultMessage: 'Segment deleted',
  },
  artifactId: {
    id: 'audience.feeds.list.column.artifactId',
    defaultMessage: 'Connector',
  },
  status: {
    id: 'audience.feeds.list.column.status',
    defaultMessage: 'Status',
  },
  filterArtifactId: {
    id: 'audience.feeds.list.filter.artifactId',
    defaultMessage: 'Connector',
  },
  filterStatus: {
    id: 'audience.feeds.list.filter.status',
    defaultMessage: 'Status',
  },
  INITIAL: {
    id: 'audience.feeds.list.status.initial',
    defaultMessage: 'Initial',
  },
  ACTIVE: {
    id: 'audience.feeds.list.status.active',
    defaultMessage: 'Active',
  },
  PAUSED: {
    id: 'audience.feeds.list.status.paused',
    defaultMessage: 'Paused',
  },
  PUBLISHED: {
    id: 'audience.feeds.list.status.published',
    defaultMessage: 'Published',
  },
});

class AudienceFeedsTable extends React.Component<Props, State> {
  feedService: AudienceSegmentFeedService;
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  constructor(props: Props) {
    super(props);

    const { feedType } = this.props;

    this.state = {
      list: {
        feeds: [],
        total: 0,
        isLoading: true,
      },
      plugins: [],
    };

    this.feedService = new AudienceSegmentFeedService('', feedType);
  }

  componentDidMount() {
    const {
      history,
      location: { search, pathname },
      match: {
        params: { organisationId },
      },
    } = this.props;

    if (!isSearchValid(search, FEEDS_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, FEEDS_SEARCH_SETTINGS),
        state: { reloadDataSource: true },
      });
    } else {
      const filter = parseSearch(search, FEEDS_SEARCH_SETTINGS);
      this.fetchFeeds(organisationId, filter);
    }
    this.fetchPlugins();
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    const {
      location: { search },
      match: {
        params: { organisationId },
      },
    } = this.props;

    const {
      location: { search: nextSearch },
      match: {
        params: { organisationId: nextOrganisationId },
      },
    } = nextProps;

    const { list, plugins } = this.state;

    const { list: nextList, plugins: nextPlugins } = nextState;

    return (
      !compareSearches(search, nextSearch) ||
      organisationId !== nextOrganisationId ||
      (list.isLoading && !nextList.isLoading) ||
      plugins.length !== nextPlugins.length
    );
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const {
      location: { pathname, search },
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;

    if (!isSearchValid(search, FEEDS_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, FEEDS_SEARCH_SETTINGS),
      });
    } else if (!prevState.list.isLoading || this.state.list.isLoading) {
      const nextFilter = parseSearch(search, FEEDS_SEARCH_SETTINGS);
      this.fetchFeeds(organisationId, nextFilter);
    }
  }

  buildApiSearchFilters = (filter: Index<any>) => {
    let formattedFilters: Index<any> = {};

    if (filter.currentPage && filter.pageSize) {
      formattedFilters = {
        ...formattedFilters,
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
    }

    if (filter.status && filter.status.length > 0) {
      formattedFilters = {
        ...formattedFilters,
        status: filter.status,
      };
    }

    if (filter.artifactId && filter.artifactId.length > 0) {
      formattedFilters = {
        ...formattedFilters,
        artifact_id: filter.artifactId,
      };
    }

    return formattedFilters;
  };

  fetchFeeds = (organisationId: string, filter: Index<any>) => {
    this.setState({
      list: {
        ...this.state.list,
        isLoading: true,
      },
    });
    return this.feedService
      .getFeeds({
        organisation_id: organisationId,
        ...this.buildApiSearchFilters(filter),
      })
      .then(feedResults => {
        // We optimize the number of calls as we don't want to call the same segment multiple times
        const audienceSegmentIds = feedResults.data
          .map(feeds => feeds.audience_segment_id)
          .filter((v, i, s) => s.indexOf(v) === i);
        return Promise.all(
          audienceSegmentIds.map(id => {
            return this._audienceSegmentService
              .getSegment(id)
              .catch(() => ({ data: undefined }));
          }),
        ).then(segmentResults => {
          const feeds = feedResults.data.map(feed => ({
            feed: feed,
            audienceSegment: segmentResults
              .map(r => r.data)
              .find(segment => {
                return !!segment && segment.id === feed.audience_segment_id;
              }),
          }));

          this.setState({
            list: {
              feeds: feeds,
              total: feedResults.total ? feedResults.total : feedResults.count,
              isLoading: false,
            },
          });
        });
      })
      .catch(() => {
        this.setState({
          list: {
            feeds: [],
            total: 0,
            isLoading: false,
          },
        });
      });
  };

  fetchPlugins() {
    const pluginType: PluginType =
      this.props.feedType === 'EXTERNAL_FEED'
        ? 'AUDIENCE_SEGMENT_EXTERNAL_FEED'
        : 'AUDIENCE_SEGMENT_TAG_FEED';

    return PluginService.getPlugins({ plugin_type: pluginType })
      .then(res => {
        this.setState({
          plugins: res.data,
        });
      })
      .catch(() => {
        this.setState({
          plugins: [],
        });
      });
  }

  updateLocationSearch = (params: Index<any>) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, FEEDS_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  };

  buildDataColumns = () => {
    const {
      match: {
        params: { organisationId },
      },
      intl,
    } = this.props;

    const dataColumns: Array<DataColumnDefinition<{
      feed: AudienceExternalFeed;
      audienceSegment?: AudienceSegmentResource;
    }>> = [
      {
        intlMessage: messages.segmentName,
        key: 'segmentName',
        isHideable: false,
        render: (
          text: string,
          record: {
            feed: AudienceExternalFeed;
            audienceSegment?: AudienceSegmentResource;
          },
        ) => (
          <span>
            {!record.audienceSegment ? (
              <FormattedMessage {...messages.segmentDeleted} />
            ) : record.audienceSegment.name ? (
              <Link
                className="mcs-campaigns-link"
                to={`/v2/o/${organisationId}/audience/segments/${record.audienceSegment.id}`}
              >
                {record.audienceSegment.name}
              </Link>
            ) : (
              <FormattedMessage {...messages.segmentNameNotFound} />
            )}
          </span>
        ),
      },
      {
        intlMessage: messages.artifactId,
        key: 'artifactId',
        isHideable: false,
        render: (
          text: string,
          record: {
            feed: AudienceExternalFeed;
            audienceSegment?: AudienceSegmentResource;
          },
        ) => <span>{record.feed.artifact_id}</span>,
      },
      {
        intlMessage: messages.status,
        key: 'status',
        isHideable: false,
        render: (
          text: string,
          record: {
            feed: AudienceExternalFeed;
            audienceSegment?: AudienceSegmentResource;
          },
        ) => {
          return (
            <Tooltip
              placement="top"
              title={intl.formatMessage(messages[record.feed.status])}
            >
              <span
                className={`mcs-feeds-status-${record.feed.status.toLowerCase()}`}
              >
                <McsIcon type="status" />
              </span>
            </Tooltip>
          );
        },
      },
    ];

    return dataColumns;
  };

  render() {
    const {
      feedType,
      location: { search },
    } = this.props;

    const {
      list: { feeds, isLoading },
      plugins,
    } = this.state;

    const filter = parseSearch(search, FEEDS_SEARCH_SETTINGS);

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: this.state.list.total,
      onChange: (page: number, size: number) =>
        this.updateLocationSearch({
          currentPage: page,
          pageSize: size,
        }),
      onShowSizeChange: (current: number, size: number) =>
        this.updateLocationSearch({
          currentPage: 1,
          pageSize: size,
        }),
    };

    let feedStatus: Status[] = [];

    if (feedType === 'EXTERNAL_FEED') {
      feedStatus = ['INITIAL', 'ACTIVE', 'PAUSED', 'PUBLISHED'];
    } else if (feedType === 'TAG_FEED') {
      feedStatus = ['ACTIVE', 'PAUSED'];
    }

    const statusItems = feedStatus.map(type => ({ key: type, value: type }));

    const filtersOptions: Array<MultiSelectProps<any>> = [];

    if (plugins.length > 0) {
      const artifactIds = Array.from(
        new Set(plugins.map(plugin => plugin.artifact_id)),
      ).sort();

      filtersOptions.push({
        displayElement: (
          <div>
            <FormattedMessage {...messages.filterArtifactId} />{' '}
            <Icon type="down" />
          </div>
        ),
        selectedItems: filter.artifactId,
        items: artifactIds,
        getKey: (artifactId: string) => artifactId,
        display: (artifactId: string) => artifactId,
        handleMenuClick: (selectedArtifactIds: string[]) =>
          this.updateLocationSearch({
            artifactId: selectedArtifactIds,
            currentPage: 1,
          }),
      });
    }

    filtersOptions.push({
      displayElement: (
        <div>
          <FormattedMessage {...messages.filterStatus} /> <Icon type="down" />
        </div>
      ),
      selectedItems: filter.status.map((status: Status) => ({
        key: status,
        value: status,
      })),
      items: statusItems,
      getKey: (item: { key: Status; value: Status }) => item.key,
      display: (item: { key: Status; value: Status }) => item.value,
      handleMenuClick: (values: Array<{ key: Status; value: Status }>) =>
        this.updateLocationSearch({
          status: values.map(v => v.value),
          currentPage: 1,
        }),
    });

    return (
      <div className="mcs-table-container">
        <TableViewFilters
          columns={this.buildDataColumns()}
          loading={isLoading}
          pagination={pagination}
          filtersOptions={filtersOptions}
          dataSource={feeds}
        />
      </div>
    );
  }
}

export default compose<Props, AudienceFeedsTableProps>(
  withRouter,
  injectIntl,
)(AudienceFeedsTable);

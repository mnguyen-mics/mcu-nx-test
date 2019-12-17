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
} from '../../../../models/Plugins';
import { DataColumnDefinition, ActionsColumnDefinition, ActionsRenderer, ActionDefinition } from '../../../../components/TableView/TableView';
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
import injectNotifications, { InjectedNotificationProps } from '../../../Notifications/injectNotifications';
import { AudienceExternalFeedTyped, AudienceTagFeedTyped } from '../../Segments/Edit/domain';

type Props = InjectedNotificationProps & RouteComponentProps<{ organisationId: string }> & InjectedIntlProps;

type RecordType = {
  feed: AudienceExternalFeedTyped | AudienceTagFeedTyped,
  audienceSegment?: AudienceSegmentResource
}

interface State {
  list: {
    feeds: RecordType[];
    total: number;
    isLoading: boolean;
  };
  externalPlugins: PluginResource[];
  tagPlugins: PluginResource[];
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
  EXTERNAL_FEED: {
    id: 'audience.feeds.list.filter.externalFeed',
    defaultMessage: 'Server Side',
  },
  TAG_FEED: {
    id: 'audience.feeds.list.filter.tagFeed',
    defaultMessage: 'Client Side',
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
  activate: {
    id: 'audience.feeds.list.column.action.activate',
    defaultMessage: 'Activate',
  },
  pause: {
    id: 'audience.feeds.list.column.action.pause',
    defaultMessage: 'Pause',
  },
  delete: {
    id: 'audience.feeds.list.column.action.delete',
    defaultMessage: 'Delete',
  },

});

class AudienceFeedsTable extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  private externalFeedService: AudienceSegmentFeedService;
  private tagFeedService: AudienceSegmentFeedService;

  constructor(props: Props) {
    super(props);

    this.state = {
      list: {
        feeds: [],
        total: 0,
        isLoading: true,
      },
      externalPlugins: [],
      tagPlugins: [],
    };

    this.externalFeedService = new AudienceSegmentFeedService('', 'EXTERNAL_FEED');
    this.tagFeedService = new AudienceSegmentFeedService('', 'TAG_FEED');
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

    const { list, externalPlugins: plugins } = this.state;

    const { list: nextList, externalPlugins: nextPlugins } = nextState;

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

  getFeedType(): AudienceFeedType {
    const {
      location: { search },
    } = this.props;

    const filter = parseSearch(search, FEEDS_SEARCH_SETTINGS);

    return filter.feedType && filter.feedType.length > 0 ? filter.feedType[0] : 'EXTERNAL_FEED';
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

    const feedService = filter.feedType && filter.feedType[0] === 'TAG_FEED' ? this.tagFeedService : this.externalFeedService;

    return feedService
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

          const feeds = feedResults.data.map(feed => {
            const feedTyped: AudienceTagFeedTyped | AudienceExternalFeedTyped = this.getFeedType() === 'TAG_FEED' ?
              { ...feed, type: 'TAG_FEED' } :
              { ...feed, type: 'EXTERNAL_FEED' }
            return {
              feed: feedTyped,
              audienceSegment: segmentResults
                .map(r => r.data)
                .find(segment => {
                  return !!segment && segment.id === feed.audience_segment_id;
                }),
            }
          });

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
    PluginService.getPlugins({ plugin_type: 'AUDIENCE_SEGMENT_EXTERNAL_FEED' })
      .then(res => {
        this.setState({
          externalPlugins: res.data,
        });
      })
      .catch(() => {
        this.setState({
          externalPlugins: [],
        });
      });

    PluginService.getPlugins({ plugin_type: 'AUDIENCE_SEGMENT_TAG_FEED' })
      .then(res => {
        this.setState({
          tagPlugins: res.data,
        });
      })
      .catch(() => {
        this.setState({
          tagPlugins: [],
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


  activateFeed = (record: RecordType) => {

    const externalFeedService = new AudienceSegmentFeedService(record.feed.audience_segment_id, 'EXTERNAL_FEED');
    const tagFeedService = new AudienceSegmentFeedService(record.feed.audience_segment_id, 'TAG_FEED');
    const feedService = record.feed.type === 'TAG_FEED' ? tagFeedService : externalFeedService;

    const {
      notifyError,
      location: { search },
    } = this.props;

    const filter = parseSearch(search, FEEDS_SEARCH_SETTINGS);

    const updatedFeed = {
      ...record.feed,
      status: "ACTIVE" as Status,
    };
    return feedService
      .updateAudienceFeed(record.feed.id, updatedFeed)
      .then(() => this.fetchFeeds(record.feed.organisation_id,filter))
      .catch(err => {
        notifyError(err);
      });

  };

  pauseFeed = (record: RecordType) => {

    const externalFeedService = new AudienceSegmentFeedService(record.feed.audience_segment_id, 'EXTERNAL_FEED');
    const tagFeedService = new AudienceSegmentFeedService(record.feed.audience_segment_id, 'TAG_FEED');
    const feedService = record.feed.type === 'TAG_FEED' ? tagFeedService : externalFeedService;

    const {
      notifyError,
      location: { search },
    } = this.props;

    const filter = parseSearch(search, FEEDS_SEARCH_SETTINGS);

    const updatedFeed = {
      ...record.feed,
      status: "PAUSED" as Status,
    };
    return feedService
      .updateAudienceFeed(record.feed.id, updatedFeed)
      .then(() => this.fetchFeeds(record.feed.organisation_id,filter)
      )
      .catch(err => {
        notifyError(err);
      });

  };

  deleteFeed = (record: RecordType) => {

    const externalFeedService = new AudienceSegmentFeedService(record.feed.audience_segment_id, 'EXTERNAL_FEED');
    const tagFeedService = new AudienceSegmentFeedService(record.feed.audience_segment_id, 'TAG_FEED');
    const feedService = record.feed.type === 'TAG_FEED' ? tagFeedService : externalFeedService;

    const {
      notifyError,
      location: { search },
    } = this.props;
   
    
    const {
      list: {
        feeds,
      },
    } = this.state
    
    const filter = parseSearch(search, FEEDS_SEARCH_SETTINGS);

    return feedService.deleteAudienceFeed(record.feed.id)
    .then(() => {
      if(feeds.length === 1 && filter.currentPage !== 1){
        const newFilter = {
          ...filter,
          currentPage: filter.currentPage - 1,
        };
        this.fetchFeeds(record.feed.organisation_id,newFilter);
      }else{
        this.fetchFeeds(record.feed.organisation_id,filter);
      }
    }).catch(err => {
        notifyError(err);
      });
  };

  renderActionColumnDefinition: ActionsRenderer<RecordType> = (record: RecordType) => {
    const actionsDefinitions: Array<ActionDefinition<RecordType>> = [];

    if (record.feed.status === 'PAUSED' || record.feed.status === 'INITIAL') {
      actionsDefinitions.push({ callback: this.activateFeed, intlMessage: messages.activate })
    } else {
      actionsDefinitions.push({ callback: this.pauseFeed, intlMessage: messages.pause })
    }
    actionsDefinitions.push({ intlMessage: messages.delete, callback: this.deleteFeed })
    return actionsDefinitions;
  }


  buildActionColumns = () => {

    const actionColumns: Array<
      ActionsColumnDefinition<RecordType>

    > = [
        {
          key: 'action',
          actions: this.renderActionColumnDefinition
        },
      ];

    return actionColumns
  }

  buildDataColumns = () => {
    const {
      match: {
        params: { organisationId },
      },
      intl,
    } = this.props;

    const dataColumns: Array<DataColumnDefinition<RecordType>> = [
      {
        intlMessage: messages.segmentName,
        key: 'segmentName',
        isHideable: false,
        render: (
          text: string,
          record: RecordType,
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
          record: RecordType,
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
              <McsIcon type="status" className={`mcs-feeds-status-${record.feed.status.toLowerCase()}`} />
            </Tooltip>
          );
        },
      },
    ];

    return dataColumns;
  };

  render() {
    const {
      location: { search },
      intl
    } = this.props;

    const {
      list: { feeds, isLoading },
      externalPlugins,
      tagPlugins,
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

    const feedType = this.getFeedType();
    let feedStatus: Status[] = [];

    if (feedType === 'EXTERNAL_FEED') {
      feedStatus = ['INITIAL', 'ACTIVE', 'PAUSED', 'PUBLISHED'];
    } else if (feedType === 'TAG_FEED') {
      feedStatus = ['ACTIVE', 'PAUSED'];
    }

    const statusItems = feedStatus.map(type => ({ key: type, value: type }));

    const filtersOptions: Array<MultiSelectProps<any>> = [{
      displayElement: (
        <div>
          {intl.formatMessage(messages[feedType])}{' '}
          <Icon type="down" />
        </div>
      ),
      selectedItems: [feedType],
      items: ['EXTERNAL_FEED', 'TAG_FEED'],
      getKey: (type: AudienceFeedType) => type,
      display: (type: AudienceFeedType) => intl.formatMessage(messages[type]),
      handleItemClick: (selectedType: AudienceFeedType) =>
        this.updateLocationSearch({
          feedType: [selectedType],
          artifactId: [],
          status: [],
          currentPage: 1,
        }),
    }];

    const plugins = feedType === 'TAG_FEED' ? tagPlugins : externalPlugins;

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
          actionsColumnsDefinition={this.buildActionColumns()}
        />
      </div>
    );
  }
}

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  injectNotifications,
)(AudienceFeedsTable);

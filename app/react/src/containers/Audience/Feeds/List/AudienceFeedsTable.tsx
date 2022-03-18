import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { InjectedIntlProps, injectIntl, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';
import {
  parseSearch,
  updateSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
} from '../../../../utils/LocationSearchHelper';
import { Index } from '../../../../utils';
import { FEEDS_SEARCH_SETTINGS } from './constants';
import { AudienceExternalFeed, PluginResource, Status } from '../../../../models/Plugins';
import {
  AudienceFeedType,
  IAudienceSegmentFeedService,
} from '../../../../services/AudienceSegmentFeedService';
import { MultiSelectProps } from '@mediarithmics-private/mcs-components-library/lib/components/multi-select';
import { Tooltip, Modal } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { IPluginService } from '../../../../services/PluginService';
import { AudienceSegmentResource } from '../../../../models/audiencesegment/AudienceSegmentResource';
import { lazyInject } from '../../../../config/inversify.config';
import { IAudienceSegmentService } from '../../../../services/AudienceSegmentService';
import { TYPES } from '../../../../constants/types';
import { Link } from 'react-router-dom';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { AudienceFeedTyped } from '../../Segments/Edit/domain';
import EditPluginModal from './EditPluginModal';
import { PluginCardModalTab } from '@mediarithmics-private/advanced-components';
import messages from '../messages';
import { injectFeatures, InjectedFeaturesProps } from '../../../Features';
import { McsIcon, TableViewFilters } from '@mediarithmics-private/mcs-components-library';
import { AutomationResource } from '../../../../models/automations/automations';
import { IScenarioService } from '../../../../services/ScenarioService';
import {
  ActionDefinition,
  ActionsColumnDefinition,
  ActionsRenderer,
  DataColumnDefinition,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';

type Props = InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedFeaturesProps &
  InjectedIntlProps;

type RecordType = {
  feed: AudienceFeedTyped;
  audienceSegment?: AudienceSegmentResource;
  scenarioResource?: AutomationResource;
};

interface State {
  list: {
    feeds: RecordType[];
    total: number;
    isLoading: boolean;
  };
  externalPlugins: PluginResource[];
  tagPlugins: PluginResource[];
  modalFeed?: AudienceFeedTyped;
  modalTab: PluginCardModalTab;
}

class AudienceFeedsTable extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceSegmentFeedServiceFactory)
  _audienceSegmentFeedServiceFactory: (
    feedType: AudienceFeedType,
  ) => (segmentId: string) => IAudienceSegmentFeedService;

  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  @lazyInject(TYPES.IScenarioService)
  private _scenarioService: IScenarioService;

  private _audienceExternalFeedServiceFactory: (segmentId: string) => IAudienceSegmentFeedService;
  private _audienceTagFeedServiceFactory: (segmentId: string) => IAudienceSegmentFeedService;
  @lazyInject(TYPES.IPluginService)
  private _pluginService: IPluginService;

  constructor(props: Props) {
    super(props);
    this._audienceExternalFeedServiceFactory =
      this._audienceSegmentFeedServiceFactory('EXTERNAL_FEED');
    this._audienceTagFeedServiceFactory = this._audienceSegmentFeedServiceFactory('TAG_FEED');
    this.state = {
      list: {
        feeds: [],
        total: 0,
        isLoading: true,
      },
      externalPlugins: [],
      tagPlugins: [],
      modalTab: 'configuration',
    };
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

    const { list, externalPlugins: plugins, modalFeed } = this.state;

    const { list: nextList, externalPlugins: nextPlugins, modalFeed: nextModalFeed } = nextState;

    return (
      !compareSearches(search, nextSearch) ||
      organisationId !== nextOrganisationId ||
      (list.isLoading && !nextList.isLoading) ||
      plugins.length !== nextPlugins.length ||
      nextModalFeed !== modalFeed
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
    return {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      status: filter.status && filter.status.length > 0 ? filter.status : undefined,
      artifact_id:
        filter.artifactId && filter.artifactId.length > 0 ? filter.artifactId : undefined,
    };
  };

  fetchFeeds = (organisationId: string, filter: Index<any>) => {
    this.setState({
      list: {
        ...this.state.list,
        isLoading: true,
      },
    });

    const feedService =
      filter.feedType && filter.feedType[0] === 'TAG_FEED'
        ? this._audienceTagFeedServiceFactory('')
        : this._audienceExternalFeedServiceFactory('');

    return feedService
      .getFeeds({
        organisation_id: organisationId,
        order_by: 'AUDIENCE_SEGMENT_NAME',
        ...this.buildApiSearchFilters(filter),
      })
      .then(feedResults => {
        const distinctScenarioIds = [...new Set(feedResults.data.map(feed => feed.scenario_id))];

        const scenariosPromise = Promise.all(
          distinctScenarioIds.map(scenarioId => {
            if (scenarioId)
              return this._scenarioService
                .getScenario(scenarioId)
                .then(resScenario => resScenario.data)
                .catch(() => undefined);
            else return undefined;
          }),
        );

        const distinctAudienceSegmentIds = [
          ...new Set(
            feedResults.data
              .filter(feed => feed.created_from === 'SEGMENT')
              .map(feed => feed.audience_segment_id),
          ),
        ];

        const audienceSegmentsPromise = Promise.all(
          distinctAudienceSegmentIds.map(audienceSegmentId =>
            this._audienceSegmentService
              .getSegment(audienceSegmentId)
              .then(resAudienceSegment => resAudienceSegment.data)
              .catch(() => undefined),
          ),
        );

        return Promise.all([scenariosPromise, audienceSegmentsPromise]).then(resPromise => {
          const resScenarios = resPromise[0];
          const resAudienceSegments = resPromise[1];

          const feeds = feedResults.data.map(feed => {
            const feedTyped: AudienceFeedTyped =
              this.getFeedType() === 'TAG_FEED'
                ? { ...feed, type: 'TAG_FEED' }
                : { ...feed, type: 'EXTERNAL_FEED' };

            const recordType: RecordType = {
              feed: feedTyped,
              audienceSegment: resAudienceSegments.find(segment => {
                return !!segment && segment.id === feed.audience_segment_id;
              }),
              scenarioResource: resScenarios.find(scenario => {
                return !!scenario && scenario.id === feed.scenario_id;
              }),
            };

            return recordType;
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
    this._pluginService
      .getPlugins({
        plugin_type: 'AUDIENCE_SEGMENT_EXTERNAL_FEED',
      })
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

    this._pluginService
      .getPlugins({ plugin_type: 'AUDIENCE_SEGMENT_TAG_FEED' })
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
    const feedService =
      record.feed.type === 'TAG_FEED'
        ? this._audienceTagFeedServiceFactory(
            record.audienceSegment ? record.audienceSegment.id : '',
          )
        : this._audienceExternalFeedServiceFactory(
            record.audienceSegment ? record.audienceSegment.id : '',
          );
    const {
      notifyError,
      location: { search },
    } = this.props;

    const filter = parseSearch(search, FEEDS_SEARCH_SETTINGS);

    const updatedFeed = {
      ...record.feed,
      status: 'ACTIVE' as Status,
    };
    return feedService
      .updateAudienceFeed(record.feed.id, updatedFeed)
      .then(() => this.fetchFeeds(record.feed.organisation_id, filter))
      .catch(err => {
        notifyError(err);
      });
  };

  pauseFeed = (record: RecordType) => {
    const feedService =
      record.feed.type === 'TAG_FEED'
        ? this._audienceTagFeedServiceFactory(
            record.audienceSegment ? record.audienceSegment.id : '',
          )
        : this._audienceExternalFeedServiceFactory(
            record.audienceSegment ? record.audienceSegment.id : '',
          );

    const {
      notifyError,
      location: { search },
    } = this.props;

    const filter = parseSearch(search, FEEDS_SEARCH_SETTINGS);

    const updatedFeed = {
      ...record.feed,
      status: 'PAUSED' as Status,
    };
    return feedService
      .updateAudienceFeed(record.feed.id, updatedFeed)
      .then(() => this.fetchFeeds(record.feed.organisation_id, filter))
      .catch(err => {
        notifyError(err);
      });
  };

  editFeed = (record: RecordType) => {
    this.setState({
      modalFeed: record.feed,
      modalTab: 'configuration',
    });
  };

  openFeedStats = (record: RecordType) => {
    this.setState({
      modalFeed: record.feed,
      modalTab: 'stats',
    });
  };

  deleteFeed = (record: RecordType) => {
    const feedService =
      record.feed.type === 'TAG_FEED'
        ? this._audienceTagFeedServiceFactory(
            record.audienceSegment ? record.audienceSegment.id : '',
          )
        : this._audienceExternalFeedServiceFactory(
            record.audienceSegment ? record.audienceSegment.id : '',
          );

    const {
      notifyError,
      location: { search },
      intl,
    } = this.props;

    const {
      list: { feeds },
    } = this.state;

    const filter = parseSearch(search, FEEDS_SEARCH_SETTINGS);

    const onOkDelete = () =>
      feedService
        .deleteAudienceFeed(record.feed.id)
        .then(() => {
          if (feeds.length === 1 && filter.currentPage !== 1) {
            const newFilter = {
              ...filter,
              currentPage: filter.currentPage - 1,
            };
            this.fetchFeeds(record.feed.organisation_id, newFilter);
          } else {
            this.fetchFeeds(record.feed.organisation_id, filter);
          }
        })
        .catch(err => {
          notifyError(err);
        });

    Modal.confirm({
      title: intl.formatMessage(messages.deleteModalTitle),
      content: intl.formatMessage(messages.deleteModalDescription),
      onOk: onOkDelete,
    });
  };

  renderActionColumnDefinition: ActionsRenderer<RecordType> = (record: RecordType) => {
    const {
      hasFeature,
      intl: { formatMessage },
    } = this.props;
    const actionsDefinitions: Array<ActionDefinition<RecordType>> = [];

    if (record.feed.created_from !== 'AUTOMATION') {
      if (record.feed.status === 'PAUSED' || record.feed.status === 'INITIAL') {
        actionsDefinitions.push({
          callback: this.activateFeed,
          message: formatMessage(messages.activate),
        });
      } else {
        actionsDefinitions.push({
          callback: this.pauseFeed,
          message: formatMessage(messages.pause),
        });
      }
      actionsDefinitions.push({
        message: formatMessage(messages.edit),
        callback: this.editFeed,
      });
    }

    if (hasFeature('audience-feeds_stats')) {
      actionsDefinitions.push({
        message: formatMessage(messages.stats),
        callback: this.openFeedStats,
      });
    }

    if (record.feed.created_from !== 'AUTOMATION') {
      actionsDefinitions.push({
        message: formatMessage(messages.delete),
        callback: this.deleteFeed,
      });
    }

    return actionsDefinitions;
  };

  buildActionColumns = () => {
    const actionColumns: Array<ActionsColumnDefinition<RecordType>> = [
      {
        key: 'action',
        actions: this.renderActionColumnDefinition,
      },
    ];

    return actionColumns;
  };

  buildDataColumns = () => {
    const {
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
    } = this.props;

    const dataColumns: Array<DataColumnDefinition<RecordType>> = [
      {
        title: formatMessage(messages.source),
        key: 'source',
        isHideable: false,
        render: (text: string, record: RecordType) => {
          if (record.feed.created_from === 'SEGMENT') {
            return (
              <span>
                {!record.audienceSegment ? (
                  <FormattedMessage {...messages.segmentDeleted} />
                ) : record.audienceSegment.name ? (
                  <Link
                    className='mcs-campaigns-link'
                    to={`/v2/o/${organisationId}/audience/segments/${record.audienceSegment.id}`}
                  >
                    {record.audienceSegment.name.length > 40 ? (
                      <Tooltip title={record.audienceSegment.name}>
                        {record.audienceSegment.name.substring(0, 40)}...
                      </Tooltip>
                    ) : (
                      record.audienceSegment.name
                    )}
                  </Link>
                ) : (
                  <FormattedMessage {...messages.segmentNameNotFound} />
                )}
              </span>
            );
          } else {
            return (
              <span>
                {record.scenarioResource ? (
                  <Link
                    className='mcs-campaigns-link'
                    to={`/v2/o/${organisationId}/automations/${record.scenarioResource.id}`}
                  >
                    {record.scenarioResource.name.length > 40 ? (
                      <Tooltip title={record.scenarioResource.name}>
                        {record.scenarioResource.name.substring(0, 40)}...
                      </Tooltip>
                    ) : (
                      record.scenarioResource.name
                    )}
                  </Link>
                ) : (
                  <FormattedMessage {...messages.scenarioNameNotFound} />
                )}
              </span>
            );
          }
        },
      },
      {
        title: formatMessage(messages.feedName),
        key: 'feedName',
        isHideable: false,
        render: (text: string, record: RecordType) => (
          <span>
            {record.feed.name ? (
              record.feed.name.length > 40 ? (
                <Tooltip title={record.feed.name}>{record.feed.name.substring(0, 40)}...</Tooltip>
              ) : (
                record.feed.name
              )
            ) : (
              '-'
            )}
          </span>
        ),
      },
      {
        title: formatMessage(messages.artifactId),
        key: 'artifactId',
        isHideable: false,
        render: (text: string, record: RecordType) => <span>{record.feed.artifact_id}</span>,
      },
      {
        title: formatMessage(messages.createdFrom),
        key: 'createdFrom',
        isHideable: false,
        render: (text: string, record: RecordType) => <span>{record.feed.created_from}</span>,
      },
      {
        title: formatMessage(messages.status),
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
            <Tooltip placement='top' title={formatMessage(messages[record.feed.status])}>
              <McsIcon
                type='status'
                className={`mcs-feeds-status-${record.feed.status.toLowerCase()}`}
              />
            </Tooltip>
          );
        },
      },
    ];

    return dataColumns;
  };

  onClose = () => {
    this.setState({
      modalFeed: undefined,
    });
  };

  onFeedChange = () => {
    const {
      location: { search },
      match: {
        params: { organisationId },
      },
    } = this.props;

    const filter = parseSearch(search, FEEDS_SEARCH_SETTINGS);
    this.fetchFeeds(organisationId, filter);
  };

  render() {
    const {
      location: { search },
      intl,
    } = this.props;

    const {
      list: { feeds, isLoading },
      externalPlugins,
      tagPlugins,
      modalFeed,
      modalTab,
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

    const filtersOptions: Array<MultiSelectProps<any>> = [
      {
        displayElement: (
          <div>
            {intl.formatMessage(messages[feedType])} <DownOutlined />
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
      },
    ];

    const plugins = feedType === 'TAG_FEED' ? tagPlugins : externalPlugins;

    if (plugins.length > 0) {
      const artifactIds = Array.from(new Set(plugins.map(plugin => plugin.artifact_id))).sort();

      filtersOptions.push({
        displayElement: (
          <div>
            <FormattedMessage {...messages.filterArtifactId} /> <DownOutlined />
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
          <FormattedMessage {...messages.filterStatus} /> <DownOutlined />
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
      <div className='mcs-table-container'>
        {modalFeed && (
          <EditPluginModal
            feed={modalFeed}
            modalTab={modalTab}
            onClose={this.onClose}
            onChange={this.onFeedChange}
          />
        )}
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
  injectFeatures,
)(AudienceFeedsTable);

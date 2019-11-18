import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { InjectedIntlProps, injectIntl, defineMessages, FormattedMessage } from 'react-intl';
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
import { AudienceExternalFeed, PluginResource, Status } from '../../../../models/Plugins';
import { DataColumnDefinition } from '../../../../components/TableView/TableView';
import AudienceSegmentFeedService from '../../../../services/AudienceSegmentFeedService';
import { MultiSelectProps } from '../../../../components/MultiSelect';
import { Icon } from 'antd';
import PluginService from '../../../../services/PluginService';
import { AudienceSegmentResource } from '../../../../models/audiencesegment/AudienceSegmentResource';
import { lazyInject } from '../../../../config/inversify.config';
import { IAudienceSegmentService } from '../../../../services/AudienceSegmentService';
import { TYPES } from '../../../../constants/types';
import { Link } from 'react-router-dom';

type Props = RouteComponentProps<{ organisationId: string }> & InjectedIntlProps;

interface State {
    list: {
        feeds: Array<{ feed: AudienceExternalFeed; audienceSegment?: AudienceSegmentResource }>;
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
});

class AudienceFeedsTable extends React.Component<Props, State> {
    feedService: AudienceSegmentFeedService;
    @lazyInject(TYPES.IAudienceSegmentService)
    private _audienceSegmentService: IAudienceSegmentService;

    constructor(props: Props) {
        super(props);
        this.state = {
            list: {
                feeds: [],
                total: 0,
                isLoading: true,
            },
            plugins: [],
        };

        this.feedService = new AudienceSegmentFeedService('', 'EXTERNAL_FEED');
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
            this.fetchPlugins();
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        const {
            location: { search },
            match: {
                params: { organisationId },
            },
            history,
        } = this.props;

        const {
            location: { pathname: nextPathname, search: nextSearch, state: nextState },
            match: {
                params: { organisationId: nextOrganisationId },
            },
        } = nextProps;

        if (
            !compareSearches(search, nextSearch) ||
            organisationId !== nextOrganisationId ||
            (nextState && nextState.reloadDataSource === true)
        ) {
            if (!isSearchValid(nextSearch, FEEDS_SEARCH_SETTINGS)) {
                history.replace({
                    pathname: nextPathname,
                    search: buildDefaultSearch(nextSearch, FEEDS_SEARCH_SETTINGS),
                    state: { reloadDataSource: organisationId !== nextOrganisationId },
                });
            } else {
                const nextFilter = parseSearch(nextSearch, FEEDS_SEARCH_SETTINGS);
                this.fetchFeeds(organisationId, nextFilter);
                this.fetchPlugins();
            }
        }
    }

    buildApiSearchFilters = (filter: Index<any>) => {
        let formattedFilters: Index<any> = {};

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
        return this.feedService
            .getFeeds({
                organisation_id: organisationId,
                ...this.buildApiSearchFilters(filter),
            })
            .then(res => {
                // We optimize the number of calls as we don't want to call the same segment multiple times
                const audienceSegmentIds = res.data
                    .map(feeds => feeds.audience_segment_id)
                    .filter((v, i, s) => s.indexOf(v) === i);
                return Promise.all(
                    audienceSegmentIds.map(id => {
                        return this._audienceSegmentService.getSegment(id);
                    }),
                ).then(results => {
                    const feeds = res.data.map(feed => ({
                        feed: feed,
                        audienceSegment: results
                            .map(r => r.data)
                            .find(segment => segment.id === feed.audience_segment_id),
                    }));

                    this.setState({
                        list: {
                            feeds: feeds,
                            total: res.total ? res.total : res.count,
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
        return PluginService.getPlugins({ plugin_type: 'AUDIENCE_SEGMENT_EXTERNAL_FEED' }).then(res => {
            this.setState({
                plugins: res.data,
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
                    record: { feed: AudienceExternalFeed; audienceSegment?: AudienceSegmentResource },
                ) => (
                    <span>
                        {record.audienceSegment && record.audienceSegment.name ? (
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
                    record: { feed: AudienceExternalFeed; audienceSegment?: AudienceSegmentResource },
                ) => <span>{record.feed.artifact_id}</span>,
            },
            {
                intlMessage: messages.status,
                key: 'status',
                isHideable: false,
                render: (
                    text: string,
                    record: { feed: AudienceExternalFeed; audienceSegment?: AudienceSegmentResource },
                ) => <span>{record.feed.status}</span>,
            },
        ];

        return dataColumns;
    };

    render() {
        const {
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

        const statusItems = ['INITIAL', 'PAUSED', 'ACTIVE', 'PUBLISHED'].map(type => ({ key: type, value: type }));

        const filtersOptions: Array<MultiSelectProps<any>> = [];

        if (plugins.length > 0) {
            const artifactIds = Array.from(new Set(plugins.map(plugin => plugin.artifact_id)));

            filtersOptions.push({
                displayElement: (
                    <div>
                        <FormattedMessage {...messages.filterArtifactId} /> <Icon type="down" />
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

export default compose<Props, {}>(withRouter, injectIntl)(AudienceFeedsTable);

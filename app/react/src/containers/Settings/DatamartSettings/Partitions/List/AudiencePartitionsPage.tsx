import * as React from 'react';
import { Layout } from 'antd';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { defineMessages } from 'react-intl';
import { DataListResponse } from '../../../../../services/ApiService';
import {
  GetPartitionOption,
  IAudiencePartitionsService,
} from '../../../../../services/AudiencePartitionsService';
import {
  AudiencePartitionResource,
  AudiencePartitionType,
} from '../../../../../models/audiencePartition/AudiencePartitionResource';
import { Loading } from '../../../../../components';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { EmptyTableView } from '../../../../../components/TableView';
import AudiencePartitionsTable from './AudiencePartitionsTable';
import AudiencePartitionsActionbar from './AudiencePartitionsActionbar';
import {
  PaginationSearchSettings,
  KeywordSearchSettings,
  DatamartSearchSettings,
  isSearchValid,
  buildDefaultSearch,
  parseSearch,
  compareSearches,
  updateSearch,
} from '../../../../../utils/LocationSearchHelper';
import { PARTITIONS_SEARCH_SETTINGS } from './constants';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';

const { Content } = Layout;

export interface AudiencePartitionsPageProps {}

interface State {
  audiencePartitions?: DataListResponse<AudiencePartitionResource>;
  fetchingPartitions: boolean;
  initialFetching: boolean;
  hasAudiencePartitions: boolean;
}

type Props = AudiencePartitionsPageProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }>;

export interface PartitionFilterParams
  extends PaginationSearchSettings,
    KeywordSearchSettings,
    DatamartSearchSettings {
  type?: AudiencePartitionType[];
}

class AudiencePartitionsPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudiencePartitionsService)
  private _audiencePartitionsService: IAudiencePartitionsService;
  constructor(props: Props) {
    super(props);
    this.state = {
      audiencePartitions: undefined,
      fetchingPartitions: false,
      initialFetching: true,
      hasAudiencePartitions: false,
    };
  }

  componentDidMount() {
    const {
      match: { params },
      location: { search, pathname },
      history,
    } = this.props;
    if (!isSearchValid(search, PARTITIONS_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, PARTITIONS_SEARCH_SETTINGS),
        state: { reloadDataSource: true },
      });
    } else {
      const filter = parseSearch<PartitionFilterParams>(
        search,
        PARTITIONS_SEARCH_SETTINGS,
      );
      this.fetchPartitions(params.organisationId, filter, true);
    }
  }

  componentDidUpdate(previousProps: Props) {
    const {
      match: { params },
      location: { search, pathname },
      history,
    } = this.props;

    const {
      match: { params: previousParams },
      location: { search: previousSearch },
    } = previousProps;

    if (
      !compareSearches(search, previousSearch) ||
      params.organisationId !== previousParams.organisationId
    ) {
      if (!isSearchValid(search, PARTITIONS_SEARCH_SETTINGS)) {
        history.replace({
          pathname: pathname,
          search: buildDefaultSearch(search, PARTITIONS_SEARCH_SETTINGS),
          state: { reloadDataSource: true },
        });
      } else {
        const filter = parseSearch<PartitionFilterParams>(
          search,
          PARTITIONS_SEARCH_SETTINGS,
        );
        this.fetchPartitions(
          params.organisationId,
          filter,
          params.organisationId !== previousParams.organisationId
        );
      }
    }
  }

  editPartition = (partition: AudiencePartitionResource) => {
    const {
      match: {
        params: { organisationId },
      },
      history,
      location,
    } = this.props;

    const editUrl = `/v2/o/${organisationId}/settings/datamart/audience/partitions/${
      partition.id
    }/edit`;

    history.push({
      pathname: editUrl,
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  updateLocationSearch = (params: Partial<PartitionFilterParams>) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;
    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, PARTITIONS_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  };

  checkIfHasPartitions = (organisationId: string) => {
    return this._audiencePartitionsService
      .getPartitions(organisationId, getPaginatedApiParam(1, 1))
      .then(res => {
        this.setState({ hasAudiencePartitions: res.count !== 0 });
      });
  };

  fetchPartitions = (
    organisationId: string,
    filter: PartitionFilterParams,
    initialFetch: boolean,
  ) => {
    this.setState({
      fetchingPartitions: true,
      initialFetching: initialFetch,
    });
    let options: GetPartitionOption = {};
    if (filter.currentPage && filter.pageSize) {
      options = {
        ...options,
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
    }
    if (filter.keywords) {
      options = {
        ...options,
        keywords: filter.keywords,
      };
    }
    if (filter.type && filter.type.length) {
      options = {
        ...options,
        type: filter.type,
      };
    }
    if (filter.datamartId) {
      options = {
        ...options,
        datamart_id: filter.datamartId,
      };
    }

    let promise;
    if (initialFetch) {
      promise = this._audiencePartitionsService
        .getPartitions(organisationId, getPaginatedApiParam(1, 1))
        .then(res => {
          if (res.total === 0 || res.count === 0) {
            this.setState({ hasAudiencePartitions: false });
            return Promise.resolve(undefined);
          }
          this.setState({ hasAudiencePartitions: true });
          return this._audiencePartitionsService.getPartitions(
            organisationId,
            options,
          );
        });
    } else {
      this.setState({ hasAudiencePartitions: true });
      promise = this._audiencePartitionsService.getPartitions(
        organisationId,
        options,
      );
    }

    promise
      .then(response => {
        this.setState({
          fetchingPartitions: false,
          initialFetching: false,
          audiencePartitions: response,
        });
      })
      .catch(err => {
        this.setState({
          fetchingPartitions: false,
          initialFetching: false,
          audiencePartitions: { ...err, data: [] },
        });
        this.props.notifyError(err);
      });
  };

  render() {
    const {
      match: { params },
      location: { search },
    } = this.props;
    const {
      hasAudiencePartitions,
      initialFetching,
      fetchingPartitions,
      audiencePartitions,
    } = this.state;

    const filter = parseSearch<PartitionFilterParams>(
      search,
      PARTITIONS_SEARCH_SETTINGS,
    );

    const handleOnArchive = () => {
      //
    };

    const content = (
      <Content className="mcs-content-container">
        {!initialFetching && !hasAudiencePartitions && (
          <EmptyTableView
            iconType="users"
            intlMessage={messageMap.noPartitionYet}
          />
        )}
        {!initialFetching && hasAudiencePartitions && (
          <AudiencePartitionsTable
            organisationId={params.organisationId}
            filter={filter}
            audiencePartitions={audiencePartitions}
            fetchingPartitions={fetchingPartitions}
            onChange={this.updateLocationSearch}
            onArchive={handleOnArchive}
            onEdit={this.editPartition}
          />
        )}
      </Content>
    );

    return (
      <Layout>
        <AudiencePartitionsActionbar />
        {initialFetching && <Loading className="loading-full-screen" />}
        {!initialFetching && content}
      </Layout>
    );
  }
}
export default compose(
  withRouter,
  injectNotifications,
)(AudiencePartitionsPage);

const messageMap = defineMessages({
  noPartitionYet: {
    id: 'audience.partitions.empty.get-started',
    defaultMessage:
      'There is no Partitions created yet! Click on New to get started',
  },
});

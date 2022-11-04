import * as React from 'react';
import { Layout } from 'antd';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl';
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
import { getWorkspace } from '../../../../../redux/Session/selectors';
import { UserWorkspaceResource } from '../../../../../models/directory/UserProfileResource';
import { DataListResponse } from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { EmptyTableView } from '@mediarithmics-private/mcs-components-library';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';

const { Content } = Layout;

interface MapStateToProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

interface State {
  audiencePartitions?: DataListResponse<AudiencePartitionResource>;
  fetchingPartitions: boolean;
  initialFetching: boolean;
  hasAudiencePartitions: boolean;
}

type Props = MapStateToProps &
  InjectedNotificationProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

export interface PartitionFilterParams
  extends PaginationSearchSettings,
    KeywordSearchSettings,
    DatamartSearchSettings {
  type?: AudiencePartitionType[];
  archived?: boolean;
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
      const filter = parseSearch<PartitionFilterParams>(search, PARTITIONS_SEARCH_SETTINGS);
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
        const filter = parseSearch<PartitionFilterParams>(search, PARTITIONS_SEARCH_SETTINGS);
        this.fetchPartitions(
          params.organisationId,
          filter,
          params.organisationId !== previousParams.organisationId,
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

    const editUrl = `/v2/o/${organisationId}/settings/datamart/audience/partitions/${partition.id}/edit`;

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

    options = {
      ...options,
      archived: false,
    };

    let promise: Promise<DataListResponse<AudiencePartitionResource>>;
    if (initialFetch) {
      promise = this._audiencePartitionsService
        .getPartitions(organisationId, getPaginatedApiParam(1, 1))
        .then(res => {
          if (res.total === 0 || res.count === 0) {
            this.setState({ hasAudiencePartitions: false });
          }
          this.setState({ hasAudiencePartitions: true });
          return this._audiencePartitionsService.getPartitions(organisationId, options);
        });
    } else {
      this.setState({ hasAudiencePartitions: true });
      promise = this._audiencePartitionsService.getPartitions(organisationId, options);
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
      workspace,
      intl,
    } = this.props;
    const { hasAudiencePartitions, initialFetching, fetchingPartitions, audiencePartitions } =
      this.state;

    const filter = parseSearch<PartitionFilterParams>(search, PARTITIONS_SEARCH_SETTINGS);

    const handleOnArchive = () => {
      //
    };

    const content = (
      <Content className='mcs-content-container'>
        {!initialFetching && !hasAudiencePartitions && (
          <EmptyTableView
            iconType='users'
            message={intl.formatMessage(messageMap.noPartitionYet)}
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
            datamarts={workspace(params.organisationId).datamarts}
          />
        )}
      </Content>
    );

    return (
      <Layout>
        <AudiencePartitionsActionbar />
        {initialFetching && <Loading isFullScreen={true} />}
        {!initialFetching && content}
      </Layout>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  workspace: getWorkspace(state),
});

export default compose(
  withRouter,
  injectIntl,
  injectNotifications,
  connect(mapStateToProps),
)(AudiencePartitionsPage);

const messageMap = defineMessages({
  noPartitionYet: {
    id: 'audience.partitions.empty.get-started',
    defaultMessage: 'There is no Partitions created yet! Click on New to get started',
  },
});

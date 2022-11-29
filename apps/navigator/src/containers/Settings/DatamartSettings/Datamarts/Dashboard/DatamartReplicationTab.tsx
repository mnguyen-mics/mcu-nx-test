import * as React from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import { compose } from 'recompose';
import {
  DatamartReplicationResourceShape,
  DatamartReplicationJobExecutionResource,
} from '../../../../../models/settings/settings';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { DatamartReplicationRouteMatchParam } from '../../DatamartReplication/Edit/domain';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IDatamartReplicationService } from '../../../../../services/DatamartReplicationService';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { Index } from '../../../../../utils';
import { parseSearch, compareSearches } from '../../../../../utils/LocationSearchHelper';
import DatamartReplicationListContainer, {
  DATAMART_REPLICATION_SEARCH_SETTINGS,
} from '../../DatamartReplication/List/DatamartReplicationListContainer';
import messages from '../../DatamartReplication/List/messages';
import DatamartReplicationJobListContainer from '../../DatamartReplication/List/DatamartReplicationJobListContainer';

interface State {
  replications: DatamartReplicationResourceShape[];
  isLoadingReplications: boolean;
  totalReplications: number;
  noReplication: boolean;
  jobExecutions: DatamartReplicationJobExecutionResource[];
  isLoadingJobExecutions: boolean;
  totalJobExecutions: number;
  noJobExecution: boolean;
}

type Props = RouteComponentProps<DatamartReplicationRouteMatchParam> &
  InjectedNotificationProps &
  WrappedComponentProps;

class DatamartReplicationTab extends React.Component<Props, State> {
  fetchLoop = window.setInterval(() => {
    const {
      match: {
        params: { datamartId },
      },
      location: { search },
    } = this.props;

    const { jobExecutions } = this.state;
    const runningExecution = jobExecutions.find(execution => execution.status === 'RUNNING');
    if (!!runningExecution) {
      const filter = parseSearch(search, DATAMART_REPLICATION_SEARCH_SETTINGS);
      this.fetchReplicationsAndJobs(datamartId, filter);
    }
  }, 5000);

  @lazyInject(TYPES.IDatamartReplicationService)
  private _datamartReplicationService: IDatamartReplicationService;

  constructor(props: Props) {
    super(props);
    this.state = {
      replications: [],
      isLoadingReplications: false,
      totalReplications: 0,
      noReplication: true,
      jobExecutions: [],
      isLoadingJobExecutions: false,
      totalJobExecutions: 0,
      noJobExecution: true,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { datamartId },
      },
      location: { search },
    } = this.props;
    const filter = parseSearch(search, DATAMART_REPLICATION_SEARCH_SETTINGS);

    this.fetchReplicationsAndJobs(datamartId, filter);
  }

  componentDidUpdate(prevProps: Props) {
    const {
      match: {
        params: { datamartId, organisationId },
      },
      location: { search },
    } = this.props;

    const {
      match: {
        params: { organisationId: prevOrganisationId, datamartId: prevDatamartId },
      },
      location: { search: prevSearch },
    } = prevProps;

    if (
      prevOrganisationId !== organisationId ||
      !compareSearches(search, prevSearch) ||
      prevDatamartId !== datamartId
    ) {
      const filter = parseSearch(search, DATAMART_REPLICATION_SEARCH_SETTINGS);
      this.fetchReplicationsAndJobs(datamartId, filter);
    }
  }

  fetchReplicationsAndJobs = (datamartId: string, filter: Index<any>) => {
    this.fetchDatamartReplications(datamartId, filter);
    this.fetchJobExecutions(datamartId, filter);
  };

  fetchDatamartReplications = (datamartId: string, filter: Index<any>) => {
    const buildOptions = () => {
      let options = {};
      if (filter.currentPage && filter.pageSize) {
        options = {
          ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
        };
      }
      if (filter.keywords) {
        return {
          ...options,
          keywords: filter.keywords,
        };
      }
      return options;
    };

    this.setState({
      isLoadingReplications: true,
    });

    return this._datamartReplicationService
      .getDatamartReplications(datamartId, buildOptions())
      .then(response => {
        this.setState({
          isLoadingReplications: false,
          noReplication: response && response.total === 0 && !filter.keywords,
          replications: response.data,
          totalReplications: response.total ? response.total : response.count,
        });
      })
      .catch(error => {
        this.setState({ isLoadingReplications: false });
        this.props.notifyError(error);
      });
  };

  fetchJobExecutions = (datamartId: string, filter: Index<string | number>) => {
    this.setState(
      {
        isLoadingJobExecutions: true,
      },
      () =>
        this._datamartReplicationService
          .getJobExecutions(datamartId)
          .then(resp => {
            this.setState({
              jobExecutions: resp.data,
              isLoadingJobExecutions: false,
              totalJobExecutions: resp.total || resp.count,
              noJobExecution: resp && resp.total === 0 && !filter.keywords,
            });
          })
          .catch(error => {
            this.props.notifyError(error);
            this.setState({
              isLoadingJobExecutions: false,
              jobExecutions: [],
              totalJobExecutions: 0,
            });
          }),
    );
  };

  onDeleteDatamartReplication = (resource: DatamartReplicationResourceShape) => {
    const {
      match: {
        params: { datamartId },
      },
      location: { search },
      notifyError,
      intl: { formatMessage },
    } = this.props;

    const filter = parseSearch(search, DATAMART_REPLICATION_SEARCH_SETTINGS);

    const deleteReplication = () => {
      return this._datamartReplicationService.deleteDatamartReplication(datamartId, resource.id);
    };

    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      title: formatMessage(messages.deleteDatamartReplicationModalTitle),
      content: formatMessage(messages.deleteDatamartReplicationModalContent),
      okText: formatMessage(messages.deleteDatamartReplication),
      cancelText: formatMessage(messages.deleteDatamartReplicationModalCancel),
      onOk: () => {
        deleteReplication()
          .then(() => {
            return this.fetchDatamartReplications(datamartId, filter);
          })
          .catch(error => {
            notifyError(error);
          });
      },
    });
  };

  onUpdateDatamartReplication = (
    replication: DatamartReplicationResourceShape,
    status: boolean,
  ) => {
    const {
      match: {
        params: { datamartId },
      },
      notifyError,
      location: { search },
    } = this.props;
    this._datamartReplicationService
      .updateDatamartReplication(datamartId, replication.id, {
        ...replication,
        status: status ? 'ACTIVE' : 'PAUSED',
      })
      .then(() => {
        const filter = parseSearch(search, DATAMART_REPLICATION_SEARCH_SETTINGS);
        return this.fetchDatamartReplications(datamartId, filter);
      })
      .catch(error => {
        notifyError(error);
      });
  };

  handleReplicationFilterChange = (newFilter: Index<any>) => {
    const {
      match: {
        params: { datamartId },
      },
    } = this.props;
    this.fetchDatamartReplications(datamartId, newFilter);
  };

  handleJobExecutionsFilterChange = (newFilter: Index<string | number>) => {
    const {
      match: {
        params: { datamartId },
      },
    } = this.props;
    this.fetchJobExecutions(datamartId, newFilter);
  };

  isLastExecutionRunning = () => {
    const { jobExecutions } = this.state;

    const runningExecution = jobExecutions.find(execution => execution.status === 'RUNNING');

    return !!runningExecution;
  };

  createJobExecution = (datamartId: string) => {
    const { notifyError } = this.props;

    return this._datamartReplicationService
      .createJobExecution(datamartId)
      .then(result => result.data)
      .catch(error => {
        notifyError(error);
      });
  };

  public render() {
    const {
      replications,
      totalReplications,
      isLoadingReplications,
      noReplication,
      jobExecutions,
      totalJobExecutions,
      isLoadingJobExecutions,
      noJobExecution,
    } = this.state;

    return (
      <div>
        <div>
          <div>
            <DatamartReplicationListContainer
              replications={replications}
              totalReplications={totalReplications}
              isLoadingReplications={isLoadingReplications}
              noReplication={noReplication}
              onFilterChange={this.handleReplicationFilterChange}
              deleteReplication={this.onDeleteDatamartReplication}
              updateReplication={this.onUpdateDatamartReplication}
              lastExecutionIsRunning={this.isLastExecutionRunning()}
            />
          </div>
        </div>
        <div>
          <div>
            <DatamartReplicationJobListContainer
              jobExecutions={jobExecutions}
              totalJobExecutions={totalJobExecutions}
              isLoadingJobExecutions={isLoadingJobExecutions}
              noJobExecution={noJobExecution}
              onFilterChange={this.handleJobExecutionsFilterChange}
              replications={replications}
              fetchReplicationsAndJobs={this.fetchReplicationsAndJobs}
              createJobExecution={this.createJobExecution}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default compose<Props, {}>(
  injectIntl,
  withRouter,
  injectNotifications,
)(DatamartReplicationTab);

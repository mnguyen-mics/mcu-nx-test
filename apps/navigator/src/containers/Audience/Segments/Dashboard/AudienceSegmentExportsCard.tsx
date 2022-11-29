import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Button, Progress, message, Modal, Input, Select, Spin } from 'antd';
import {
  IAudienceSegmentService,
  AudienceSegmentExportJobExecutionResource,
  AudienceSegmentExportJobIdentifierType,
} from '../../../../services/AudienceSegmentService';
import { formatMetric } from '../../../../utils/MetricHelper';
import { formatUnixTimestamp } from '../../../../utils/DateHelper';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { TYPES } from '../../../../constants/types';
import { lazyInject } from '../../../../config/inversify.config';
import { defineMessages, WrappedComponentProps, injectIntl, FormattedMessage } from 'react-intl';
import {
  injectThemeColors,
  InjectedThemeColorsProps,
} from '@mediarithmics-private/advanced-components';
import { UserAccountCompartmentDatamartSelectionResource } from '../../../../models/datamart/DatamartResource';
import { IDatamartService } from '../../../../services/DatamartService';
import { Filters } from '../../../../components/ItemList';
import { getPaginatedApiParam, getApiToken } from '../../../../utils/ApiHelper';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import {
  DataColumnDefinition,
  TableViewProps,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { TableViewWithSelectionNotifyerMessages } from '../../../../components/TableView';
import FileSaver from 'file-saver';

const InputGroup = Input.Group;
const Option = Select.Option;

export interface AudienceSegmentExportsCardProps {
  datamartId: string;
  segmentId: string;
}

type Props = AudienceSegmentExportsCardProps &
  InjectedNotificationProps &
  InjectedThemeColorsProps &
  WrappedComponentProps &
  RouteComponentProps<{}>;

interface AudienceSegmentExportExecutionItems {
  items: AudienceSegmentExportJobExecutionResource[];
  total: number;
}

interface State {
  isLoadingExecutions: boolean;
  isLoadingCompartments: boolean;
  isModalVisible: boolean;
  executions: AudienceSegmentExportExecutionItems;
  compartments: UserAccountCompartmentDatamartSelectionResource[];
  selectedCompartmentId?: string;
  identifierType: AudienceSegmentExportJobIdentifierType;
  filter: Filters;
  dataExportState: Record<string, number>;
}

const AudienceSegmentExportJobTableView =
  TableViewWithSelectionNotifyerMessages as React.ComponentClass<
    TableViewProps<AudienceSegmentExportJobExecutionResource>
  >;

const messages = defineMessages({
  submissionDate: {
    id: 'audience.segments.dashboard.segmentExportsList.submissionDate',
    defaultMessage: 'Submission Date',
  },
  status: {
    id: 'audience.segments.dashboard.segmentExportsList.status',
    defaultMessage: 'Status',
  },
  progress: {
    id: 'audience.segments.dashboard.segmentExportsList.progress',
    defaultMessage: 'Progress',
  },
  startDate: {
    id: 'audience.segments.dashboard.segmentExportsList.startDate',
    defaultMessage: 'Start Date',
  },
  endDate: {
    id: 'audience.segments.dashboard.segmentExportsList.endDate',
    defaultMessage: 'End Date',
  },
  userIdentifierType: {
    id: 'audience.segments.dashboard.segmentExportsList.userIdentifierType',
    defaultMessage: 'User Identifier type',
  },
  totalUserPoints: {
    id: 'audience.segments.dashboard.segmentExportsList.totalUserPoints',
    defaultMessage: 'User Points in segment',
  },
  totalExportedUserPoints: {
    id: 'audience.segments.dashboard.segmentExportsList.totalExportedUserPoints',
    defaultMessage: 'Exported User Points (with identifiers)',
  },
  totalExportedIdentifiers: {
    id: 'audience.segments.dashboard.segmentExportsList.totalExportedIdentifiers',
    defaultMessage: 'Exported Identifiers',
  },
  download: {
    id: 'audience.segments.dashboard.segmentExportsList.download',
    defaultMessage: 'Download',
  },
  exportRunning: {
    id: 'audience.segments.dashboard.segmentExportsList.running',
    defaultMessage: 'An export execution is already running',
  },
  exportFailed: {
    id: 'audience.segments.dashboard.segmentExportsList.failed',
    defaultMessage: 'This export has failed. Please launch another execution.',
  },
  exportRunningDownload: {
    id: 'audience.segments.dashboard.segmentExportsList.running.download',
    defaultMessage: 'This export is being created, please try again when the export has succeeded.',
  },
  createExport: {
    id: 'audience.segments.dashboard.segmentExportsList.startNew',
    defaultMessage: 'New export',
  },
  popupTitle: {
    id: 'audience.segments.dashboard.segmentExportsList.startNew.modal.title',
    defaultMessage: 'Enter the type of user identifier that you want to export',
  },
});

class AudienceSegmentExportsCard extends React.Component<Props, State> {
  fetchLoop = window.setInterval(() => {
    const { executions, filter } = this.state;
    if (
      executions.items.length > 0 &&
      executions.items.some(
        (value, index, array) => value.status === 'PENDING' || value.status === 'RUNNING',
      )
    ) {
      this.refreshData(filter);
    }
  }, 5000);

  @lazyInject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;

  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoadingExecutions: true,
      isLoadingCompartments: true,
      isModalVisible: false,
      compartments: [],
      executions: {
        items: [],
        total: 0,
      },
      dataExportState: {},
      identifierType: 'USER_AGENT',
      filter: {
        currentPage: 1,
        pageSize: 10,
      },
    };
  }

  componentDidMount() {
    const { datamartId } = this.props;
    this.refreshData(this.state.filter);

    this.fetchCompartments(datamartId);
  }

  fetchCompartments = (datamartId: string) => {
    this._datamartService
      .getUserAccountCompartmentDatamartSelectionResources(datamartId, {
        // with_source_datamarts: true --> For enabling CROSS_DATAMART exports
        with_source_datamarts: true,
      })
      .then(res => {
        this.setState({
          compartments: res.data,
          isLoadingCompartments: false,
          selectedCompartmentId: res.data.filter(c => c.default)[0]
            ? res.data.filter(c => c.default)[0].compartment_id
            : undefined,
        });
      })
      .catch(err => {
        this.props.notifyError(err);
        this.setState({ isLoadingCompartments: false });
      });
  };

  refreshData = (newFilter: Filters) => {
    const { segmentId } = this.props;

    this.setState({ filter: newFilter });

    const params = {
      ...getPaginatedApiParam(newFilter.currentPage, newFilter.pageSize),
    };

    this._audienceSegmentService
      .findAudienceSegmentExportExecutionsBySegment(segmentId, params)
      .then(res => {
        this.setState({
          isLoadingExecutions: false,
          executions: {
            items: res.data,
            total: res.total ? res.total : res.count,
          },
        });
      })
      .catch(err => {
        this.props.notifyError(err);
        this.setState({ isLoadingExecutions: false });
      });
  };

  getExecutionProgress = (execution: AudienceSegmentExportJobExecutionResource) => {
    const { colors } = this.props;
    const tasks = execution.num_tasks || 0;
    const completedTasks =
      execution.status === 'SUCCEEDED'
        ? execution.num_tasks || 0 // dirty hack, to fix small possible margin between completed and num_tasks
        : (execution.completed_tasks || 0) + (execution.erroneous_tasks || 0);

    const setColor = (status: string) => {
      switch (status) {
        case 'RUNNING':
        case 'PENDING':
          return colors['mcs-primary'];
        case 'SUCCESS':
          return colors['mcs-success'];
        case 'SUCCEEDED':
          return colors['mcs-success'];
        case 'FAILED':
          return colors['mcs-error'];
        default:
          return colors['mcs-primary'];
      }
    };
    return {
      percent: tasks ? completedTasks / tasks : 0,
      color: setColor(execution.status),
    };
  };

  private startDownload = (recordId: string) => {
    const { dataExportState } = this.state;

    this.props.notifyInfo({
      message:
        'Your download request is processing. Do not refresh your page to avoid canceling it.',
    });
    if (!dataExportState.hasOwnProperty(recordId)) {
      this.setState(prevState => {
        const newState = prevState;
        newState.dataExportState[recordId] = 0;
        return newState;
      });
    }
  };

  private finaliseDownload = (recordId: string) => {
    const { dataExportState } = this.state;

    if (dataExportState.hasOwnProperty(recordId)) {
      this.setState(prevState => {
        const newState = prevState;
        delete newState.dataExportState[recordId];
        return newState;
      });
    }
  };

  downloadFile = (execution: AudienceSegmentExportJobExecutionResource) => (e: any) => {
    const {
      intl: { formatMessage },
    } = this.props;

    if (execution.status === 'RUNNING' || execution.status === 'PENDING') {
      message.error(formatMessage(messages.exportRunning));
    } else if (execution.status === 'FAILED') {
      message.error(formatMessage(messages.exportFailed));
    } else if (execution.status === 'SUCCEEDED') {
      this.startDownload(execution.id);
      const url = `${(window as any).MCS_CONSTANTS.API_URL}/v1/data_file/data?uri=${
        execution.result ? execution.result.export_file_uri : ''
      }`;

      const transferFailed = () => {
        this.props.notifyInfo({ message: 'Your download has failed.' });
        this.finaliseDownload(execution.id);
      };
      const transferCanceled = () => {
        this.props.notifyInfo({ message: 'Your download as been canceled.' });
        this.finaliseDownload(execution.id);
      };
      const oReq = new XMLHttpRequest();
      oReq.responseType = 'blob';
      oReq.onload = () => {
        if (oReq.status >= 200 && oReq.status < 400) {
          if (execution.result && execution.result.export_file_uri) {
            FileSaver.saveAs(oReq.response, execution.result.export_file_uri.split('/').pop());
          } else {
            FileSaver.saveAs(oReq.response);
          }
        } else {
          const responsePromise: Promise<any> = oReq.response.text();
          responsePromise.then(responseAsText => {
            const response = JSON.parse(responseAsText);
            const notification = { message: `${response.error} (error id: ${response.error_id})` };
            if (oReq.status < 500) {
              this.props.notifyWarning(notification);
            } else {
              this.props.notifyError(notification);
            }
          });
        }
        this.finaliseDownload(execution.id);
      };
      oReq.open('get', url, true);
      oReq.addEventListener('error', transferFailed, false);
      oReq.addEventListener('abort', transferCanceled, false);

      oReq.setRequestHeader('Authorization', getApiToken());
      oReq.send();
    }
  };

  submitModal = () => {
    const { segmentId } = this.props;
    const { identifierType, selectedCompartmentId } = this.state;
    const exportUserIdentifier =
      identifierType === 'USER_ACCOUNT'
        ? { type: identifierType, compartment_id: selectedCompartmentId }
        : { type: identifierType };

    // On submit, we go back to the 1st page, to display the new execution.
    // (But we keep the same page)
    const newFilter = {
      ...this.state.filter,
      currentPage: 1,
    };
    this.setState({
      filter: newFilter,
    });

    this._audienceSegmentService
      .createAudienceSegmentExport(segmentId, exportUserIdentifier)
      .then(() => this.refreshData(newFilter))
      .catch(err => {
        this.props.notifyError(err);
      });
    this.handleModal(false);
  };

  handleModal = (visible: boolean) => {
    this.setState({
      isModalVisible: visible,
    });
  };

  createCompartmentOptions = (compartments: UserAccountCompartmentDatamartSelectionResource[]) => {
    const compartmentOptions = compartments.map(compartment => (
      <Select.Option key={compartment.compartment_id} value={compartment.compartment_id}>
        {`${compartment.compartment_id} - ${compartment.name}`}
      </Select.Option>
    ));
    return compartmentOptions;
  };

  updateIdentifierType = (type: AudienceSegmentExportJobIdentifierType) => {
    this.setState({
      identifierType: type,
    });
  };

  updateCompartment = (compartmentId: string) => {
    this.setState({
      selectedCompartmentId: compartmentId,
    });
  };

  componentWillUnmount() {
    window.clearInterval(this.fetchLoop);
  }

  render() {
    const {
      intl: { formatMessage },
    } = this.props;
    const {
      isLoadingExecutions,
      isLoadingCompartments,
      compartments,
      selectedCompartmentId,
      dataExportState,
    } = this.state;

    const pagination = {
      current: this.state.filter.currentPage,
      pageSize: this.state.filter.pageSize,
      total: this.state.executions.total,
      onChange: (page: number, size: number) => {
        this.setState({ isLoadingExecutions: true });
        this.refreshData({
          currentPage: page,
          pageSize: size,
        });
      },
      onShowSizeChange: (current: number, size: number) => {
        this.setState({ isLoadingExecutions: true });
        this.refreshData({
          pageSize: size,
          currentPage: 1,
        });
      },
    };

    const onReturnClick = () => this.handleModal(false);
    const onSubmitClick = (e: any) => this.submitModal();

    const dataColumns: Array<DataColumnDefinition<AudienceSegmentExportJobExecutionResource>> = [
      {
        title: formatMessage(messages.submissionDate),
        key: 'submissionDate',
        isVisibleByDefault: true,
        isHideable: false,
        render: (text, record) => formatUnixTimestamp(record.creation_date, 'DD/MM/YYYY HH:mm:ss'),
      },
      {
        title: formatMessage(messages.status),
        key: 'status',
        isHideable: false,
        render: (text, record) => text,
      },
      {
        title: formatMessage(messages.progress),
        key: 'progress',
        isHideable: false,
        render: (text: string, record) => (
          // we should update ant design in order to have strokeColor prop
          // currently we can't pass color
          // https://github.com/ant-design/ant-design/blob/master/components/progress/progress.tsx
          <div>
            <Progress showInfo={false} percent={this.getExecutionProgress(record).percent * 100} />
          </div>
        ),
      },
      {
        title: formatMessage(messages.startDate),
        key: 'startDate',
        isVisibleByDefault: true,
        isHideable: false,
        render: (text, record) => formatUnixTimestamp(record.start_date, 'DD/MM/YYYY HH:mm:ss'),
      },
      {
        title: formatMessage(messages.endDate),
        key: 'endDate',
        isVisibleByDefault: true,
        isHideable: false,
        render: (text, record) =>
          formatUnixTimestamp(
            record.start_date && record.duration ? record.start_date + record.duration : undefined,
            'DD/MM/YYYY HH:mm:ss',
          ),
      },
      {
        title: formatMessage(messages.userIdentifierType),
        key: 'userIdentifierType',
        isHideable: false,
        render: (text, record) =>
          record.parameters ? record.parameters.export_user_identifier.type : '',
      },
      {
        title: formatMessage(messages.totalUserPoints),
        key: 'totalUserPoints',
        isVisibleByDefault: true,
        isHideable: false,
        render: (text, record) =>
          formatMetric(record.result ? record.result.total_user_points_in_segment : '-', '0'),
      },
      {
        title: formatMessage(messages.totalExportedUserPoints),
        key: 'totalExportedUserPoints',
        isVisibleByDefault: true,
        isHideable: false,
        render: (text, record) =>
          formatMetric(record.result ? record.result.total_exported_user_points : '-', '0'),
      },
      {
        title: formatMessage(messages.totalExportedIdentifiers),
        key: 'totalExportedIdentifiers',
        isVisibleByDefault: true,
        isHideable: false,
        render: (text, record) =>
          formatMetric(record.result ? record.result.total_exported_identifiers : '-', '0'),
      },
      {
        key: 'action',
        render: (text, record) => {
          return (
            (record.status === 'SUCCEEDED' &&
              record.result &&
              record.result.export_file_uri &&
              !dataExportState.hasOwnProperty(record.id) && (
                <Button type='primary' onClick={this.downloadFile(record)}>
                  <McsIcon type='download' /> {this.props.intl.formatMessage(messages.download)}
                </Button>
              )) ||
            (dataExportState.hasOwnProperty(record.id) && <Spin size='small' />)
          );
        },
      },
    ];

    const executionsData = this.state.executions.items;

    const showCompartment = this.state.identifierType === 'USER_ACCOUNT' && compartments.length > 0;

    const compartmentOptions = this.createCompartmentOptions(compartments);

    const onClickNewExport = () => this.handleModal(true);

    return (
      <div className='ant-layout mcs-modal_container'>
        <Modal
          title={<FormattedMessage {...messages.popupTitle} />}
          wrapClassName='vertical-center-modal'
          visible={this.state.isModalVisible}
          footer={
            <React.Fragment>
              <Button key='back' size='large' onClick={onReturnClick}>
                Return
              </Button>
              <Button
                disabled={false}
                key='submit'
                type='primary'
                size='large'
                onClick={onSubmitClick}
              >
                Submit
              </Button>
            </React.Fragment>
          }
          onCancel={onReturnClick}
        >
          <InputGroup compact={true} style={{ display: 'flex' }}>
            <Select
              style={{ width: '30%' }}
              defaultValue={this.state.identifierType}
              onChange={this.updateIdentifierType}
            >
              <Option value='USER_AGENT'>User Agents</Option>
              <Option value='USER_ACCOUNT'>User Accounts</Option>
              <Option value='USER_EMAIL'>Email Hash</Option>
            </Select>
            {showCompartment && (
              <div style={{ display: 'flex' }}>
                <div
                  style={{
                    paddingLeft: '30px',
                    paddingRight: '5px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  Compartment :
                </div>
                <Select
                  showSearch={true}
                  defaultValue={selectedCompartmentId}
                  onChange={this.updateCompartment}
                >
                  {compartmentOptions}
                </Select>
              </div>
            )}
          </InputGroup>
        </Modal>
        <div style={{ flex: 1, justifyContent: 'flex-end', display: 'flex' }}>
          <Button
            style={{
              marginBottom: '20px',
              width: '14%',
            }}
            onClick={onClickNewExport}
            loading={isLoadingCompartments}
          >
            <FormattedMessage {...messages.createExport} />
          </Button>
        </div>
        <AudienceSegmentExportJobTableView
          columns={dataColumns}
          dataSource={executionsData}
          loading={isLoadingExecutions}
          pagination={pagination}
        />
      </div>
    );
  }
}

export default compose<Props, AudienceSegmentExportsCardProps>(
  withRouter,
  injectIntl,
  injectNotifications,
  injectThemeColors,
)(AudienceSegmentExportsCard);

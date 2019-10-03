import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Button, Progress, message, Modal, Input, Select } from 'antd';
import {
  IAudienceSegmentService,
  AudienceSegmentExportJobExecutionResource,
  AudienceSegmentExportJobIdentifierType,
} from '../../../../services/AudienceSegmentService';
import { formatMetric } from '../../../../utils/MetricHelper';
import { formatUnixTimestamp } from '../../../../utils/DateHelper';

import { TableView } from '../../../../components/TableView';
import {
  TableViewProps,
  DataColumnDefinition,
} from '../../../../components/TableView/TableView';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import log from '../../../../utils/Logger';
import { TYPES } from '../../../../constants/types';
import { lazyInject } from '../../../../config/inversify.config';
import {
  defineMessages,
  InjectedIntlProps,
  injectIntl,
  FormattedMessage,
} from 'react-intl';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../Helpers/injectThemeColors';
import LocalStorage from '../../../../services/LocalStorage';
import { UserAccountCompartmentDatamartSelectionResource } from '../../../../models/datamart/DatamartResource';
import DatamartService from '../../../../services/DatamartService';
import { Loading, McsIcon } from '../../../../components';

const InputGroup = Input.Group;
const Option = Select.Option;

export interface AudienceSegmentExportsCardProps {
  datamartId: string;
  isLoading?: boolean;
}

type Props = AudienceSegmentExportsCardProps &
  InjectedNotificationProps &
  InjectedThemeColorsProps &
  InjectedIntlProps &
  RouteComponentProps<{ segmentId: string }>;

interface AudienceSegmentExportExecutionItems {
  items: AudienceSegmentExportJobExecutionResource[];
  total: number;
}

interface State {
  isLoading: boolean;
  isModalVisible: boolean;
  executions: AudienceSegmentExportExecutionItems;
  compartments?: UserAccountCompartmentDatamartSelectionResource[];
  selectedCompartmentId?: string;
  identifierType: AudienceSegmentExportJobIdentifierType;
}

const AudienceSegmentExportJobTableView = TableView as React.ComponentClass<
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
    id:
      'audience.segments.dashboard.segmentExportsList.totalExportedUserPoints',
    defaultMessage: 'Exported User Points (with identifiers)',
  },
  totalExportedIdentifiers: {
    id:
      'audience.segments.dashboard.segmentExportsList.totalExportedIdentifiers',
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
    defaultMessage:
      'This export is being created, please try again when the export has succeeded.',
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
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      isModalVisible: false,
      executions: {
        items: [],
        total: 0,
      },
      identifierType: 'USER_AGENT',
    };
  }

  componentDidMount() {
    const { datamartId } = this.props;
    this.refreshData();

    this.fetchCompartments(datamartId);
  }

  fetchCompartments = (datamartId: string) => {
    this.setState({
      isLoading: true,
    });

    DatamartService.getUserAccountCompartments(datamartId).then(res => {
      this.setState({
        compartments: res.data,
        isLoading: false,
        selectedCompartmentId: res.data.filter(c => c.default)[0]
          ? res.data.filter(c => c.default)[0].compartment_id
          : undefined,
      });
    });
  };

  refreshData = () => {
    const {
      match: {
        params: { segmentId },
      },
    } = this.props;
    this.setState({ isLoading: true });
    this._audienceSegmentService
      .findAudienceSegmentExportExecutionsBySegment(segmentId)
      .then(res => {
        this.setState({
          isLoading: false,
          executions: {
            items: res.data,
            total: res.total ? res.total : res.count,
          },
        });
      })
      .catch(err => {
        log.error(err);
        this.props.notifyError(err);
        this.setState({ isLoading: false });
      });
  };

  getExecutionProgress = (
    execution: AudienceSegmentExportJobExecutionResource,
  ) => {
    // move this later, and replace it in Imports.tsx
    const { colors } = this.props;
    const tasks = execution.num_tasks || 0;
    const completedTasks =
      (execution.completed_tasks || 0) + (execution.erroneous_tasks || 0);

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

  downloadFile = (execution: AudienceSegmentExportJobExecutionResource) => (
    e: any,
  ) => {
    const {
      intl: { formatMessage },
    } = this.props;

    if (execution.status === 'RUNNING' || execution.status === 'PENDING') {
      message.error(formatMessage(messages.exportRunning));
    } else if (execution.status === 'FAILED') {
      message.error(formatMessage(messages.exportFailed));
    } else if (execution.status === 'SUCCEEDED') {
      (window as any).location = `${
        (window as any).MCS_CONSTANTS.API_URL
      }/v1/data_file/data?access_token=${encodeURIComponent(
        LocalStorage.getItem('access_token')!,
      )}&uri=${execution.result ? execution.result.export_file_uri : ''}`;
    }
  };

  submitModal = () => {
    const {
      match: {
        params: { segmentId },
      },
    } = this.props;
    const { identifierType, selectedCompartmentId } = this.state;
    const exportUserIdentifier =
      identifierType === 'USER_ACCOUNT'
        ? { type: identifierType, compartment_id: selectedCompartmentId }
        : { type: identifierType };

    this._audienceSegmentService.createAudienceSegmentExport(
      segmentId,
      exportUserIdentifier,
    );
    this.handleModal(false);
  };

  handleModal = (visible: boolean) => {
    this.setState({
      isModalVisible: visible,
    });
  };

  createCompartmentOptions = (
    compartments: UserAccountCompartmentDatamartSelectionResource[],
  ) => {
    const compartmentOptions = compartments.map(compartment => (
      <Select.Option key={compartment.compartment_id}>
        {compartment.compartment_id}
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

  render() {
    const { isLoading, compartments, selectedCompartmentId } = this.state;

    const onReturnClick = () => this.handleModal(false);
    const onSubmitClick = (e: any) => this.submitModal();

    const dataColumns: Array<
      DataColumnDefinition<AudienceSegmentExportJobExecutionResource>
    > = [
      {
        intlMessage: messages.submissionDate,
        key: 'submissionDate',
        isVisibleByDefault: true,
        isHideable: false,
        render: (text, record) =>
          formatUnixTimestamp(record.creation_date, 'DD/MM/YYYY HH:mm:ss'),
      },
      {
        intlMessage: messages.status,
        key: 'status',
        isHideable: false,
        render: (text, record) => text,
      },
      {
        intlMessage: messages.progress,
        key: 'progress',
        isHideable: false,
        render: (text: string, record) => (
          // we should update ant design in order to have strokeColor prop
          // currently we can't pass color
          // https://github.com/ant-design/ant-design/blob/master/components/progress/progress.tsx
          <div>
            <Progress
              showInfo={false}
              percent={this.getExecutionProgress(record).percent * 100}
            />
          </div>
        ),
      },
      {
        intlMessage: messages.startDate,
        key: 'startDate',
        isVisibleByDefault: true,
        isHideable: false,
        render: (text, record) =>
          formatUnixTimestamp(record.start_date, 'DD/MM/YYYY HH:mm:ss'),
      },
      {
        intlMessage: messages.endDate,
        key: 'endDate',
        isVisibleByDefault: true,
        isHideable: false,
        render: (text, record) =>
          formatUnixTimestamp(
            record.start_date && record.duration
              ? record.start_date + record.duration
              : undefined,
            'DD/MM/YYYY HH:mm:ss',
          ),
      },
      {
        intlMessage: messages.userIdentifierType,
        key: 'userIdentifierType',
        isHideable: false,
        render: (text, record) =>
          record.parameters
            ? record.parameters.export_user_identifier.type
            : '',
      },
      {
        intlMessage: messages.totalUserPoints,
        key: 'totalUserPoints',
        isVisibleByDefault: true,
        isHideable: false,
        render: (text, record) =>
          formatMetric(
            record.result ? record.result.total_user_points_in_segment : '-',
            '0',
          ),
      },
      {
        intlMessage: messages.totalExportedUserPoints,
        key: 'totalExportedUserPoints',
        isVisibleByDefault: true,
        isHideable: false,
        render: (text, record) =>
          formatMetric(
            record.result ? record.result.total_exported_user_points : '-',
            '0',
          ),
      },
      {
        intlMessage: messages.totalExportedIdentifiers,
        key: 'totalExportedIdentifiers',
        isVisibleByDefault: true,
        isHideable: false,
        render: (text, record) =>
          formatMetric(
            record.result ? record.result.total_exported_identifiers : '-',
            '0',
          ),
      },
      {
        key: 'action',
        render: (text, record) => {
          return (
            record.status === 'SUCCEEDED' && (
              <Button type="primary" onClick={this.downloadFile(record)}>
                <McsIcon type="download" />{' '}
                {this.props.intl.formatMessage(messages.download)}
              </Button>
            )
          );
        },
      },
    ];

    const executionsData = this.state.executions.items;

    if (isLoading || !compartments) {
      return <Loading className="loading-full-screen" />;
    } else {
      const showCompartment =
        this.state.identifierType === 'USER_ACCOUNT' && compartments.length > 0;

      const compartmentOptions = this.createCompartmentOptions(compartments);

      const onUserLookupClick = () => this.handleModal(true);

      return (
        <div className="ant-layout">
          <Modal
            title={<FormattedMessage {...messages.popupTitle} />}
            wrapClassName="vertical-center-modal"
            visible={this.state.isModalVisible}
            footer={
              <React.Fragment>
                <Button key="back" size="large" onClick={onReturnClick}>
                  Return
                </Button>
                <Button
                  disabled={false}
                  key="submit"
                  type="primary"
                  size="large"
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
                <Option value="USER_AGENT">User Agents</Option>
                <Option value="USER_ACCOUNT">User Accounts</Option>
                <Option value="USER_EMAIL">Email Hash</Option>
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
                    Compartment Id :
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
          <div
            style={{ flex: 1, justifyContent: 'flex-start', display: 'flex' }}
          >
            <Button
              className="mcs-primary"
              style={{
                marginBottom: '15px',
                marginLeft: '15px',
                width: '14%',
              }}
              type="primary"
              onClick={onUserLookupClick}
            >
              <McsIcon type="extend" />{' '}
              <FormattedMessage {...messages.createExport} />
            </Button>
          </div>
          <AudienceSegmentExportJobTableView
            columns={dataColumns}
            dataSource={executionsData}
            loading={isLoading}
          />
        </div>
      );
    }
  }
}

export default compose<Props, AudienceSegmentExportsCardProps>(
  withRouter,
  injectIntl,
  injectNotifications,
  injectThemeColors,
)(AudienceSegmentExportsCard);

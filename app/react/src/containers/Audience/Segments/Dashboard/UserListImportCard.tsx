import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import {
  UserSegmentImportJobExecutionResource,
  IAudienceSegmentService,
} from '../../../../services/AudienceSegmentService';
import { EditAudienceSegmentParam } from '../Edit/domain';
import { formatMetric } from '../../../../utils/MetricHelper';
import { formatUnixTimestamp } from '../../../../utils/DateHelper';

import { JobExecutionStatus } from '../../../../models/Job/JobResource';
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
import { defineMessages } from 'react-intl';

export interface UserListImportCardProps {
  datamartId: string;
  segmentId: string;
}

type Props = UserListImportCardProps &
  InjectedNotificationProps &
  RouteComponentProps<EditAudienceSegmentParam>;

interface State {
  isLoading: boolean;
  executions: UserSegmentImportJobExecutionResource[];
}

export interface ImportExecutionsData {
  submissionDate: number;
  status: JobExecutionStatus;
  totalUserSegmentTreated?: number;
  totalUserSegmentImported?: number;
}

const ImportJobTableView = TableView as React.ComponentClass<
  TableViewProps<ImportExecutionsData>
>;

const messages = defineMessages({
  submissionDate: {
    id: 'audience.segments.dashboard.userImportList.submissionDate',
    defaultMessage: 'Submission Date',
  },
  status: {
    id: 'audience.segments.dashboard.userImportList.status',
    defaultMessage: 'Status',
  },
  totalUserSegmentTreated: {
    id: 'audience.segments.dashboard.userImportList.totalUserSegmentTreated',
    defaultMessage: 'User Segments Treated',
  },
  totalUserSegmentImported: {
    id: 'audience.segments.dashboard.userImportList.totalUserSegmentImported',
    defaultMessage: 'User Segments Imported',
  },
});

class UserListImportCard extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      executions: [],
    };
  }

  componentDidMount() {
    this.refreshData();
  }

  refreshData = () => {
    const {
      datamartId,
      segmentId
    } = this.props;
    this.setState({ isLoading: true });
    this._audienceSegmentService
      .findUserListImportExecutionsBySegment(datamartId, segmentId)
      .then(res => {
        this.setState({
          isLoading: false,
          executions: res.data,
        });
      })
      .catch(err => {
        log.error(err);
        this.props.notifyError(err);
        this.setState({ isLoading: false });
      });
  };

  render() {
    const { isLoading } = this.state;

    const dataColumns: Array<DataColumnDefinition<ImportExecutionsData>> = [
      {
        intlMessage: messages.submissionDate,
        key: 'submissionDate',
        isVisibleByDefault: true,
        isHideable: false,
        render: (text, record) => formatUnixTimestamp(record.submissionDate),
      },
      {
        intlMessage: messages.status,
        key: 'status',
        isHideable: false,
        render: (text, record) => text,
      },
      {
        intlMessage: messages.totalUserSegmentTreated,
        key: 'totalUserSegmentTreated',
        isVisibleByDefault: true,
        isHideable: false,
        render: (text, record) => formatMetric(text, '0', '', ''),
      },
      {
        intlMessage: messages.totalUserSegmentImported,
        key: 'totalUserSegmentImported',
        isVisibleByDefault: true,
        isHideable: false,
        render: (text, record) => formatMetric(text, '0', '', ''),
      },
    ];

    const executionsData = this.state.executions.map(execution => {
      return {
        status: execution.status,
        totalUserSegmentTreated: execution.result
          ? execution.result.total_user_segment_treated
          : undefined,
        totalUserSegmentImported: execution.result
          ? execution.result.total_user_segment_imported
          : undefined,
        submissionDate: execution.creation_date,
      };
    });

    return (
      <ImportJobTableView
        columns={dataColumns}
        dataSource={executionsData}
        loading={isLoading}
      />
    );
  }
}

export default compose<Props, UserListImportCardProps>(
  withRouter,
  injectNotifications,
)(UserListImportCard);

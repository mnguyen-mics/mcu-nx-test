import { Layout, message, Modal } from 'antd';
import * as React from 'react';
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { Card, ContentHeader } from '@mediarithmics-private/mcs-components-library';
import {
  AudiencePartitionResource,
  AudiencePartitionStatus,
} from '../../../../../models/audiencePartition/AudiencePartitionResource';
import { UserPartitionSegment } from '../../../../../models/audiencesegment/AudienceSegmentResource';
import { DatamartResource } from '../../../../../models/datamart/DatamartResource';
import ReportService from '../../../../../services/ReportService';
import { Index } from '../../../../../utils';
import McsMoment from '../../../../../utils/McsMoment';
import { normalizeReportView } from '../../../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../../../utils/Normalizer';
import { InjectedWorkspaceProps, injectWorkspace } from '../../../../Datamart/index';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import PartitionActionBar from './PartitionActionBar';
import { IAudiencePartitionsService } from '../../../../../services/AudiencePartitionsService';
import { IAudienceSegmentService } from '../../../../../services/AudienceSegmentService';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';
import { IQueryService } from '../../../../../services/QueryService';
import {
  DataColumnDefinition,
  TableViewProps,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { TableViewWithSelectionNotifyerMessages } from '../../../../../components/TableView';

const { Content } = Layout;

const messages = defineMessages({
  partNumber: {
    id: 'partition.dashboard.partNumber',
    defaultMessage: 'Partition number',
  },
  users: {
    id: 'partition.dashboard.users',
    defaultMessage: 'Users',
  },
  percentage: {
    id: 'partition.dashboard.percentage',
    defaultMessage: 'Percentage',
  },
  overview: {
    id: 'partition.dashboard.overview',
    defaultMessage: 'Overview',
  },
  partitionPublished: {
    id: 'partition.dashboard.partitionPublished',
    defaultMessage: 'Partition Published',
  },
  publishModalTitle: {
    id: 'partition.dashboard.publish.modal.title',
    defaultMessage: 'Are you sure you want to publish this partition ?',
  },
  publishModalMessage: {
    id: 'partition.dashboard.publish.modal.message',
    defaultMessage:
      'Once published it will assign every new UserPoint to a partition. This action cannot be undone.',
  },
  publishModalCancel: {
    id: 'partition.dashboard.publish.modal.cancel.button',
    defaultMessage: 'Cancel',
  },
  publishModalOk: {
    id: 'partition.dashboard.publish.modal.ok.button',
    defaultMessage: 'Ok',
  },
  datamartNotFoundError: {
    id: 'partition.dashboard.err',
    defaultMessage:
      'The datamart related to this partition is no longer a datamart of this organisation.',
  },
});

interface PartitionState {
  audiencePartition?: AudiencePartitionResource;
  userPartitionSegments: UserPartitionSegment[];
  statBySegmentId: Index<{ audience_segment_id: number; user_points: number }>;
  totalUserPoint?: number;
  isLoading: boolean;
  isLoadingStats: boolean;
}

type JoinedProps = InjectedWorkspaceProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string; partitionId: string }>;

const PartitionTable = TableViewWithSelectionNotifyerMessages as React.ComponentClass<
  TableViewProps<UserPartitionSegment>
>;

class Partition extends React.Component<JoinedProps, PartitionState> {
  @lazyInject(TYPES.IAudiencePartitionsService)
  private _audiencePartitionsService: IAudiencePartitionsService;

  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      audiencePartition: undefined,
      userPartitionSegments: [],
      isLoading: false,
      isLoadingStats: false,
      totalUserPoint: 0,
      statBySegmentId: {},
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { partitionId },
      },
    } = this.props;
    this.loadData(partitionId);
  }

  componentDidUpdate(previousProps: JoinedProps) {
    const {
      history,
      match: {
        params: { partitionId, organisationId },
      },
    } = this.props;

    const {
      match: {
        params: { partitionId: previousPartitionId },
      },
    } = previousProps;

    const { audiencePartition } = this.state;

    if (
      audiencePartition &&
      audiencePartition.organisation_id &&
      audiencePartition.organisation_id !== organisationId
    ) {
      history.push(`/v2/o/${organisationId}/settings/datamart/audience/partitions`);
    }

    if (previousPartitionId !== partitionId) this.loadData(partitionId);
  }

  loadData = (partitionId: string) => {
    const {
      workspace,
      match: {
        params: { organisationId },
      },
      intl,
    } = this.props;
    this.setState({ isLoading: true, isLoadingStats: true });
    this._audiencePartitionsService
      .getPartition(partitionId)
      .then(partitionRes => {
        const datamart = workspace.datamarts.find(d => d.id === partitionRes.data.datamart_id);
        const audiencePromises: Array<Promise<any>> = [
          this._audienceSegmentService.getSegments(organisationId, {
            audience_partition_id: partitionId,
            type: ['USER_PARTITION'],
            max_results: 500,
          }),
          ReportService.getAudienceSegmentReport(
            organisationId,
            new McsMoment('now'),
            new McsMoment('now'),
            ['audience_segment_id'],
            ['user_points'],
          ),
        ];

        const promises = datamart
          ? audiencePromises.concat(this.fetchTotalUsers(datamart))
          : [Promise.reject(intl.formatMessage(messages.datamartNotFoundError))];

        return Promise.all(promises)
          .then(res => {
            const normalized = normalizeReportView<{
              audience_segment_id: number;
              user_points: number;
            }>(res[1].data.report_view);
            this.setState({
              isLoading: false,
              audiencePartition: partitionRes.data,
              userPartitionSegments: res[0].data as UserPartitionSegment[],
              isLoadingStats: false,
              totalUserPoint: res[2] ? res[2] : 0,
              statBySegmentId: normalizeArrayOfObject(normalized, 'audience_segment_id'),
            });
          })
          .catch(e => Promise.reject(e));
      })
      .catch(err => {
        this.props.notifyError(err, {
          description: err,
        });
        this.setState({
          isLoading: false,
          isLoadingStats: false,
        });
      });
  };

  fetchTotalUsers = (datamart: DatamartResource): Promise<number> => {
    switch (datamart.storage_model_version) {
      case 'v201709':
        return this._queryService
          .runOTQLQuery(datamart.id, 'select @count {} from UserPoint')
          .then(res => {
            return res.data ? res.data.rows[0].count : 0;
          });
      case 'v201506':
        return this._queryService.runSelectorQLQuery(datamart.id).then(res => res.data.total);
      default:
        return Promise.resolve(0);
    }
  };

  publishPartition = () => {
    const {
      match: {
        params: { partitionId },
      },
      intl,
    } = this.props;
    const { audiencePartition } = this.state;

    this.setState({
      isLoading: true,
    });
    const publishedStatus: AudiencePartitionStatus = 'PUBLISHED';
    const publishedPartitionData = {
      ...audiencePartition,
      status: publishedStatus,
    };
    this._audiencePartitionsService
      .publishPartition(partitionId, publishedPartitionData)
      .then(resp => {
        this.loadData(partitionId);
        message.success(intl.formatMessage(messages.partitionPublished));
      });
  };

  buildColumnDefinition = (): Array<DataColumnDefinition<UserPartitionSegment>> => {
    const {
      intl: { formatMessage },
    } = this.props;
    const { isLoadingStats, statBySegmentId, totalUserPoint } = this.state;
    return [
      {
        title: formatMessage(messages.partNumber),
        key: 'part_number',
        isHideable: false,
        render: (text, record) => record.part_number,
      },
      {
        title: formatMessage(messages.users),
        key: 'users',
        isHideable: false,
        render: (text, record) => {
          if (isLoadingStats) {
            return <i className='mcs-table-cell-loading' />;
          }
          const value = statBySegmentId[record.id];
          return value ? value.user_points : '-';
        },
      },
      {
        title: formatMessage(messages.percentage),
        key: 'percentage',
        isHideable: false,
        render: (text, record) => {
          if (isLoadingStats) {
            return <i className='mcs-table-cell-loading' />;
          }
          const value = statBySegmentId[record.id];
          if (value && totalUserPoint) {
            const percent = (value.user_points / totalUserPoint) * 100;
            return !isNaN(percent) ? `${percent.toFixed(2)} %` : '-';
          }
          return '-';
        },
      },
    ];
  };

  displayHidePublishModal = () => {
    const { intl } = this.props;
    Modal.confirm({
      title: intl.formatMessage(messages.publishModalTitle),
      content: intl.formatMessage(messages.publishModalMessage),
      onOk: this.publishPartition,
      cancelText: intl.formatMessage(messages.publishModalCancel),
    });
  };

  render() {
    const { intl } = this.props;
    const { isLoading, audiencePartition, userPartitionSegments } = this.state;

    const partitionName = audiencePartition ? audiencePartition.name : '';

    return (
      <div className='ant-layout'>
        <PartitionActionBar
          partition={this.state.audiencePartition}
          publishPartition={this.displayHidePublishModal}
        />
        <div className='ant-layout'>
          <Content className='mcs-content-container'>
            <ContentHeader title={partitionName} loading={isLoading} />
            <Card title={intl.formatMessage(messages.overview)}>
              <hr />
              <PartitionTable
                dataSource={userPartitionSegments}
                columns={this.buildColumnDefinition()}
                loading={isLoading}
              />
            </Card>
          </Content>
        </div>
      </div>
    );
  }
}

export default compose(withRouter, injectIntl, injectWorkspace, injectNotifications)(Partition);

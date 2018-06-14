import { Layout, message, Modal } from 'antd';
import * as React from 'react';
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import Card from '../../../../components/Card/Card';
import ContentHeader from '../../../../components/ContentHeader';
import TableView, { DataColumnDefinition, TableViewProps } from '../../../../components/TableView/TableView';
import { AudiencePartitionResource, AudiencePartitionStatus } from '../../../../models/audiencePartition/AudiencePartitionResource';
import { UserPartitionSegment } from '../../../../models/audiencesegment/AudienceSegmentResource';
import { DatamartResource } from '../../../../models/datamart/DatamartResource';
import AudiencePartitionService from '../../../../services/AudiencePartitionsService';
import AudienceSegmentService from '../../../../services/AudienceSegmentService';
import QueryService from '../../../../services/QueryService';
import ReportService from '../../../../services/ReportService';
import { Index } from '../../../../utils';
import McsMoment from '../../../../utils/McsMoment';
import { normalizeReportView } from '../../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';
import { InjectedWorkspaceProps, injectWorkspace } from '../../../Datamart/index';
import injectNotifications, { InjectedNotificationProps } from '../../../Notifications/injectNotifications';
import PartitionActionBar from './PartitionActionBar';


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
});

interface PartitionProps {}

interface PartitionState {
  audiencePartition?: AudiencePartitionResource;
  userPartitionSegments: UserPartitionSegment[];
  statBySegmentId: Index<{ audience_segment_id: number; user_points: number }>;
  totalUserPoint: number;
  isLoading: boolean;
  isLoadingStats: boolean;
}

type JoinedProps = PartitionProps &
  InjectedWorkspaceProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string; partitionId: string }>;

const PartitionTable = TableView as React.ComponentClass<
  TableViewProps<UserPartitionSegment>
>;

class Partition extends React.Component<JoinedProps, PartitionState> {
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

  componentWillReceiveProps(nextProps: JoinedProps) {
    const { history } = this.props;
    if (
      this.state.audiencePartition &&
      this.state.audiencePartition.organisation_id &&
      this.state.audiencePartition.organisation_id !==
        nextProps.match.params.organisationId
    ) {
      history.push(
        `/v2/o/${nextProps.match.params.organisationId}/audience/partitions`,
      );
    }
    if (
      nextProps.match.params.partitionId !== this.props.match.params.partitionId
    ) {
      this.loadData(nextProps.match.params.partitionId);
    }
  }

  loadData = (partitionId: string) => {
    const {
      workspace,
      match: {
        params: { organisationId },
      },
    } = this.props;
    this.setState({ isLoading: true, isLoadingStats: true });    
    AudiencePartitionService.getPartition(partitionId).then(partitionRes => {
      const datamart = workspace.datamarts.find(
        d => d.id === partitionRes.data.datamart_id,
      )!;
      return Promise.all([
        AudienceSegmentService.getSegments(organisationId, {
          audience_partition_id: partitionId,
          type: 'USER_PARTITION',
          max_results: 500,
        }).then(segmentsRes => {
          this.setState({
            isLoading: false,
            audiencePartition: partitionRes.data,
            userPartitionSegments: segmentsRes.data as UserPartitionSegment[],
          });
          return segmentsRes;
        }),      
        Promise.all([
          this.fetchTotalUsers(datamart),
          ReportService.getAudienceSegmentReport(
            organisationId,
            new McsMoment('now'),
            new McsMoment('now'),
            ['audience_segment_id'],
            ['user_points'],
          ),
        ]).then(([total, reportViewRes]) => {
          const normalized = normalizeReportView<{
            audience_segment_id: number;
            user_points: number;
          }>(reportViewRes.data.report_view);
        
          this.setState({
            isLoadingStats: false,
            totalUserPoint: total,
            statBySegmentId: normalizeArrayOfObject(normalized, 'audience_segment_id')
          });
          return reportViewRes;
        }),
      ]);
    }).catch(err => {
      this.props.notifyError(err);
      this.setState({
        isLoading: false,
        isLoadingStats: false,
      })
    });
  };

  fetchTotalUsers = (datamart: DatamartResource): Promise<number> => {
    switch (datamart.storage_model_version) {
      case 'v201709':
        return QueryService.runOTQLQuery(
          datamart.id,
          'select @count {} from UserPoint',
        ).then(res => {
          return res.data ? res.data.rows[0].count : 0;
        });
      case 'v201506':
        return QueryService.runSelectorQLQuery(datamart.id).then(
          res => res.data.total,
        );
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
    AudiencePartitionService.publishPartition(
      partitionId,
      publishedPartitionData,
    ).then(resp => {
      this.loadData(partitionId);
      message.success(intl.formatMessage(messages.partitionPublished));
    });
  };

  buildColumnDefinition = (): Array<
    DataColumnDefinition<UserPartitionSegment>
  > => {
    const { isLoadingStats, statBySegmentId, totalUserPoint } = this.state;
    return [
      {
        intlMessage: messages.partNumber,
        key: 'part_number',
        isHideable: false,
        render: (text, record) => record.part_number,
      },
      {
        intlMessage: messages.users,
        key: 'users',
        isHideable: false,
        render: (text, record) => {
          if (isLoadingStats){
            return <i className="mcs-table-cell-loading" />; 
          }
          const value = statBySegmentId[record.id];
          return value ? value.user_points : '-'
        },
      },
      {
        intlMessage: messages.percentage,
        key: 'percentage',
        isHideable: false,
        render: (text, record) => {
          if (isLoadingStats){
            return <i className="mcs-table-cell-loading" />; 
          }
          const value = statBySegmentId[record.id];
          return value ? `${((value.user_points / totalUserPoint) * 100).toFixed(2)} %`  : '-'
        }
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
    const { isLoading, audiencePartition, userPartitionSegments  } = this.state;

    const partitionName = audiencePartition ? audiencePartition.name : '';

    return (
      <div className="ant-layout">
        <PartitionActionBar
          partition={this.state.audiencePartition}
          publishPartition={this.displayHidePublishModal}
        />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <ContentHeader
              title={partitionName}
              loading={isLoading}
            />
            <Card title={intl.formatMessage(messages.overview)}>
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

export default compose(
  withRouter,
  injectIntl,
  injectWorkspace,
  injectNotifications,
)(Partition);

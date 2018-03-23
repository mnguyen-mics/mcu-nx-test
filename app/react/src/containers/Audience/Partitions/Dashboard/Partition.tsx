import * as React from 'react';
import { compose } from 'recompose';
import { Layout, message } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';
import queryString from 'query-string';

import PartitionActionBar from './PartitionActionBar';
import ContentHeader from '../../../../components/ContentHeader';
import Card from '../../../../components/Card/Card';
import TableView from '../../../../components/TableView/TableView';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import {
  AudiencePartitionResource,
  AudiencePartitionStatus,
} from '../../../../models/audiencePartition/AudiencePartitionResource';
import AudiencePartitionService from '../../../../services/AudiencePartitionsService';
import { AudienceSegmentResource } from '../../../../models/audiencesegment';
import AudienceSegmentService from '../../../../services/AudienceSegmentService';
import Loading from '../../../../components/Loading';
import { injectDatamart, InjectedDatamartProps } from '../../../Datamart/index';

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
});

interface PartitionProps {}

interface PartitionState {
  partitionData: AudiencePartitionResource;
  partitions: AudienceSegmentResource[];
  isLoading: boolean;
}

type JoinedProps = PartitionProps &
  InjectedDatamartProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string; partitionId: string }>;

class Partition extends React.Component<JoinedProps, PartitionState> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      partitionData: {},
      partitions: [],
      isLoading: true,
    };
  }

  componentDidMount() {
    const { match: { params: { partitionId } } } = this.props;
    AudiencePartitionService.getPartition(partitionId)
      .then(resp => resp.data)
      .then(partitionData => {
        this.fetchSegments().then(partitions => {
          this.setState({
            partitionData: partitionData,
            partitions: partitions,
            isLoading: false,
          });
        });
      });
  }

  fetchSegments = () => {
    const {
      match: { params: { organisationId, partitionId } },
      location: { search },
    } = this.props;
    const query = queryString.parse(search);
    const datamartId = query.datamart ? query.datamart : this.props.datamart.id;
    const options = {
      audience_partition_id: partitionId,
    };
    return AudienceSegmentService.getSegments(
      organisationId,
      datamartId,
      options,
    )
      .then(res => res.data)
      .then(partitions => {
        return partitions;
      });
  };

  publishPartition = () => {
    const { match: { params: { partitionId } }, intl } = this.props;
    const { partitionData } = this.state;
    this.setState({
      isLoading: true,
    });
    const publishedStatus: AudiencePartitionStatus = 'PUBLISHED';
    const publishedPartitionData = {
      ...partitionData,
      status: publishedStatus,
    };
    AudiencePartitionService.publishPartition(
      partitionId,
      publishedPartitionData,
    ).then(resp => {
      this.fetchSegments().then(partitions => {
        this.setState({
          partitionData: resp.data,
          partitions: partitions,
          isLoading: false,
        });
      });

      message.success(intl.formatMessage(messages.partitionPublished));
    });
  };

  buildColumnDefinition = () => {
    return [
      {
        intlMessage: messages.partNumber,
        key: 'part_number',
        isHideable: false,
        render: (text: string) => text,
      },
      {
        intlMessage: messages.users,
        key: 'users',
        isHideable: false,
        render: (text: string) => (text ? text : '-'),
      },
      {
        intlMessage: messages.percentage,
        key: 'percentage',
        isHideable: false,
        render: (text: string) => (text ? text : '-'),
      },
    ];
  };

  render() {
    const { intl } = this.props;
    const { isLoading } = this.state;
    return isLoading ? (
      <Loading className="loading-full-screen" />
    ) : (
      <div className="ant-layout">
        <PartitionActionBar
          partition={this.state.partitionData}
          publishPartition={this.publishPartition}
        />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <ContentHeader title={this.state.partitionData.name} />
            <Card title={intl.formatMessage(messages.overview)}>
              <TableView
                dataSource={this.state.partitions}
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

export default compose(withRouter, injectIntl, injectDatamart)(Partition);

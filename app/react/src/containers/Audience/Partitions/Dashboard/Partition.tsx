import * as React from 'react';
import { compose } from 'recompose';
import { Layout } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';
import queryString from 'query-string';

import PartitionActionBar from './PartitionActionBar';
import ContentHeader from '../../../../components/ContentHeader';
import Card from '../../../../components/Card/Card';
import TableView from '../../../../components/TableView/TableView';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { AudiencePartitionResource } from '../../../../models/audiencePartition/AudiencePartitionResource';
import AudiencePartitionService from '../../../../services/AudiencePartitionsService';
import { AudienceSegmentResource } from '../../../../models/audiencesegment';
import AudienceSegmentService from '../../../../services/AudienceSegmentService';
import Loading from '../../../../components/Loading';
import { injectDatamart, InjectedDatamartProps } from '../../../Datamart/index';

const { Content } = Layout;

const messages = defineMessages({
  partNumber: {
    id: 'partNumber',
    defaultMessage: 'Partition number',
  },
  users: {
    id: 'users',
    defaultMessage: 'Users',
  },
  percentage: {
    id: 'percentage',
    defaultMessage: 'Percentage',
  },
  overview: {
    id: 'overview',
    defaultMessage: 'Overview',
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
    const {
      match: { params: { organisationId, partitionId } },
      location: { search },
    } = this.props;
    AudiencePartitionService.getPartition(partitionId)
      .then(resp => resp.data)
      .then(partitionData => {
        const query = queryString.parse(search);
        const datamartId = query.datamart
          ? query.datamart
          : this.props.datamart.id;
        const options = {
          audience_partition_id: partitionId,
        };
        AudienceSegmentService.getSegments(organisationId, datamartId, options)
          .then(res => res.data)
          .then(partitions => {
            this.setState({
              partitionData: partitionData,
              partitions: partitions,
              isLoading: false,
            });
          });
      });
  }

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
    return this.state.isLoading ? (
      <Loading className="loading-full-screen" />
    ) : (
      <div className="ant-layout">
        <PartitionActionBar partition={this.state.partitionData} />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <ContentHeader title={this.state.partitionData.name} />
            <Card title={intl.formatMessage(messages.overview)}>
              <TableView
                dataSource={this.state.partitions}
                columns={this.buildColumnDefinition()}
                loading={this.state.isLoading}
              />
            </Card>
          </Content>
        </div>
      </div>
    );
  }
}

export default compose(withRouter, injectIntl, injectDatamart)(Partition);

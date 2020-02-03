import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import moment from 'moment';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { compose } from 'recompose';
import { Layout, Tooltip, Progress } from 'antd';
import { messages } from '../List/messages';
import DatamartReplicationActionBar from './DatamartReplicationActionBar';
import ContentHeader from '../../../../../components/ContentHeader';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IDatamartReplicationService } from '../../../../../services/DatamartReplicationService';
import {
  DatamartReplicationResourceShape,
  DatamartReplicationJobExecutionResource,
} from '../../../../../models/settings/settings';
import { isPubSubReplication } from '../Edit/domain';
import { TableView } from '../../../../../components/TableView';
import { McsIcon } from '../../../../../components';
import { getExecutionInfo } from '../../../../../utils/JobHelpers';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../../Helpers/injectThemeColors';
import {
  parseSearch,
  PAGINATION_SEARCH_SETTINGS,
  updateSearch,
} from '../../../../../utils/LocationSearchHelper';
import { Filters } from '../../../../../components/ItemList';
import { Card } from '../../../../../components/Card';

const { Content } = Layout;

type Props = InjectedIntlProps &
  InjectedThemeColorsProps &
  InjectedNotificationProps &
  RouteComponentProps<{
    organisationId: string;
    datamartId: string;
    datamartReplicationId: string;
  }>;

interface State {
  datamartReplication?: DatamartReplicationResourceShape;
  jobExecutions: DatamartReplicationJobExecutionResource[];
  isLoadingJobExecutions: boolean;
  totalJobExecutions: number;
}

class DatamartReplicationDashboard extends React.Component<Props, State> {
  @lazyInject(TYPES.IDatamartReplicationService)
  private _datamartReplicationService: IDatamartReplicationService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoadingJobExecutions: false,
      jobExecutions: [],
      totalJobExecutions: 0,
    };
  }

  componentDidMount() {
    this.fetchDatamartReplicationAndExecutions();
  }

  fetchDatamartReplicationAndExecutions = () => {
    const {
      match: {
        params: { datamartId, datamartReplicationId },
      },
    } = this.props;

    this._datamartReplicationService
      .getDatamartReplication(datamartId, datamartReplicationId)
      .then(resp => {
        this.setState({
          datamartReplication: resp.data,
        });
      })
      .catch(error => {
        this.props.notifyError(error);
      });
    this.setState(
      {
        isLoadingJobExecutions: true,
      },
      () =>
        this._datamartReplicationService
          .getJobExecutions(datamartReplicationId)
          .then(resp => {
            this.setState({
              jobExecutions: resp.data,
              isLoadingJobExecutions: false,
              totalJobExecutions: resp.total || resp.count,
            });
          })
          .catch(error => {
            this.props.notifyError(error);
            this.setState({
              isLoadingJobExecutions: false,
            });
          }),
    );
  };

  deleteDatamartReplication = (replicationId: string) => {
    const {
      match: {
        params: { datamartId },
      },
    } = this.props;
    this._datamartReplicationService.deleteDatamartReplication(
      datamartId,
      replicationId,
    );
  };

  renderStatuColumn = (record: DatamartReplicationJobExecutionResource) => {
    switch (record.status) {
      case 'SUCCEEDED':
      case 'SUCCESS':
        return (
          <div>
            {record.status}{' '}
            {record.result &&
            record.result.total_failure &&
            record.result.total_failure > 0 ? (
              <span>
                - with errors{' '}
                <Tooltip
                  placement="top"
                  title={record.error && record.error.message}
                >
                  <McsIcon type="question" />
                </Tooltip>
              </span>
            ) : (
              undefined
            )}
          </div>
        );
      default:
        return <div>{record.status}</div>;
    }
  };

  buildColumnDefinition = () => {
    const {
      intl: { formatMessage },
      colors,
    } = this.props;

    return [
      {
        intlMessage: messages.executionId,
        key: 'id',
        isHideable: false,
        render: (text: string) => text,
      },
      {
        intlMessage: messages.executionStatus,
        key: 'status',
        isHideable: false,
        render: (
          text: string,
          record: DatamartReplicationJobExecutionResource,
        ) => this.renderStatuColumn(record),
      },
      {
        intlMessage: messages.executionProgress,
        key: 'progress',
        isHideable: false,
        render: (
          text: string,
          record: DatamartReplicationJobExecutionResource,
        ) => (
          // we should update ant design in order to have strokeColor prop
          // currently we can't pass color
          // https://github.com/ant-design/ant-design/blob/master/components/progress/progress.tsx
          <div>
            <Progress
              showInfo={false}
              percent={getExecutionInfo(record, colors).percent * 100}
            />
          </div>
        ),
      },
      {
        intlMessage: messages.startDate,
        key: 'start_date',
        isHideable: false,
        render: (text: string) =>
          text
            ? moment(text).format('DD/MM/YYYY HH:mm:ss')
            : formatMessage(messages.notStarted),
      },
      {
        intlMessage: messages.endDate,
        key: 'end_date',
        isHideable: false,
        render: (
          text: string,
          record: DatamartReplicationJobExecutionResource,
        ) =>
          record.start_date && record.duration
            ? moment(record.start_date + record.duration).format(
                'DD/MM/YYYY HH:mm:ss',
              )
            : formatMessage(messages.notEnded),
      },
      {
        intlMessage: messages.creationDate,
        key: 'creation_date',
        isHideable: false,
        render: (text: string) =>
          text
            ? moment(text).format('DD/MM/YYYY HH:mm:ss')
            : formatMessage(messages.notCreated),
      },
    ];
  };

  updateLocationSearch = (params: Filters) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, PAGINATION_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  };

  render() {
    const {
      datamartReplication,
      jobExecutions,
      isLoadingJobExecutions,
      totalJobExecutions,
    } = this.state;

    const {
      intl: { formatMessage },
      location: { search },
    } = this.props;

    const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);
    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      onChange: (page: number) =>
        this.updateLocationSearch({
          currentPage: page,
        }),
      onShowSizeChange: (current: number, size: number) =>
        this.updateLocationSearch({
          pageSize: size,
        }),
      total: totalJobExecutions,
    };

    return (
      <div className="ant-layout">
        <DatamartReplicationActionBar
          item={datamartReplication}
          deleteReplication={this.deleteDatamartReplication}
        />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <ContentHeader
              title={(datamartReplication && datamartReplication.name) || ''}
              subTitle={
                (datamartReplication &&
                  isPubSubReplication(datamartReplication) &&
                  `${datamartReplication.project_id}/${datamartReplication.topic_id}`) ||
                ''
              }
              loading={!(datamartReplication && datamartReplication.name)}
            />
            <Card title={formatMessage(messages.jobExecutions)}>
              <hr />
              <TableView
                dataSource={jobExecutions}
                columns={this.buildColumnDefinition()}
                // actionsColumnsDefinition={[]}
                pagination={pagination}
                loading={isLoadingJobExecutions}
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
  injectThemeColors,
  injectNotifications,
)(DatamartReplicationDashboard);

import * as React from 'react';
import { compose } from 'recompose';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Row, Layout, Modal, Tooltip } from 'antd';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { Index } from '../../../../../utils';
import messages from './messages';
import {
  KEYWORD_SEARCH_SETTINGS,
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
} from '../../../../../utils/LocationSearchHelper';
import DatamartReplicationJobTable from './DatamartReplicationJobTable';
import { injectDrawer } from '../../../../../components/Drawer';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import {
  DatamartReplicationJobExecutionResource,
  DatamartReplicationResourceShape,
} from '../../../../../models/settings/settings';
import { DatamartReplicationRouteMatchParam } from '../Edit/domain';

const { Content } = Layout;

export const DATAMART_REPLICATION_SEARCH_SETTINGS = [
  ...KEYWORD_SEARCH_SETTINGS,
  ...PAGINATION_SEARCH_SETTINGS,
];

interface DatamartReplicationJobListContainerProps {
  jobExecutions: DatamartReplicationJobExecutionResource[];
  isLoadingJobExecutions: boolean;
  totalJobExecutions: number;
  noJobExecution: boolean;
  onFilterChange: (newFilter: Index<string | number>) => void;
  replications: DatamartReplicationResourceShape[];
  fetchReplicationsAndJobs: (datamartId: string, filter: Index<any>) => void;
  createJobExecution: (datamartId: string) => Promise<void | DatamartReplicationJobExecutionResource>;
}

type Props = DatamartReplicationJobListContainerProps &
  RouteComponentProps<DatamartReplicationRouteMatchParam> &
  InjectedNotificationProps &
  InjectedIntlProps &
  InjectedDrawerProps;

class DatamartReplicationJobListContainer extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {
      jobExecutions: [],
      totalJobExecutions: 0,
      isLoadingJobExecutions: true,
      noItem: false,
    };
  }

  buildNewActionElement = () => {
    const {
      jobExecutions,
      intl: { formatMessage },
    } = this.props;
    const lastExecutionIsLessThan7days = jobExecutions.find(
      execution => execution.status === 'SUCCEEDED' && execution.creation_date > Date.now() - 7 * 24 * 3600 * 1000,
    );
    const onClick = () => {
      const {
        replications,
        match: {
          params: { datamartId },
        },
        location: { search },
      } = this.props;

      const liveReplications = replications.filter(rep => rep.status === 'ACTIVE');

      if (liveReplications.length >= 1) {
        const filter = parseSearch(
          search,
          DATAMART_REPLICATION_SEARCH_SETTINGS,
        );
        const replicationExecution = () => {
          return this.props.createJobExecution(datamartId)
        };
        Modal.confirm({
          icon: <ExclamationCircleOutlined />,
          title: formatMessage(messages.executionModalTitle),
          content: (
            <React.Fragment>
              {liveReplications.map(replication => {
                return <div key={replication.id}> - {replication.name}</div>;
              })}
              <br />
              {formatMessage(messages.executionModalContent)}
            </React.Fragment>
          ),

          okText: formatMessage(messages.newExecution),
          cancelText: formatMessage(messages.cancelAction),
          onOk: () => {
            replicationExecution().then(() => {
              this.props.fetchReplicationsAndJobs(datamartId, filter);
            });
          },
        });
      } else {
        Modal.confirm({
          icon: <ExclamationCircleOutlined />,
          title: formatMessage(messages.noExecutionModalTitle),
          content: formatMessage(messages.noExecutionModalContent),
        });
      }
    };
    const ToolTipWrapper = (button: React.ReactNode) => {
      return (
        <Tooltip
          placement="top"
          title={formatMessage(messages.noExecutionPossible)}
        >
          {button}
        </Tooltip>
      );
    };
    const executionButton = (
      <Button
        key={messages.newDatamartReplication.id}
        type="primary"
        onClick={onClick}
        disabled={!!lastExecutionIsLessThan7days}
        className={"mcs-replicationNewExecution_button"}
      >
        <FormattedMessage {...messages.newExecution} />
      </Button>
    );
    return !!lastExecutionIsLessThan7days
      ? ToolTipWrapper(executionButton)
      : executionButton;
  };

  render() {
    const {
      isLoadingJobExecutions,
      totalJobExecutions,
      jobExecutions,
      noJobExecution,
      onFilterChange,
    } = this.props;

    return (
      <div className="ant-layout">
        <Content className="mcs-content-container">
          <Row className="mcs-table-container">
            <div>
              <div className="mcs-card-header mcs-card-title">
                <span className="mcs-card-title">
                  <FormattedMessage {...messages.initialSynchronization} />
                </span>
                <span className="mcs-card-button">
                  {this.buildNewActionElement()}
                </span>
              </div>
              <hr className="mcs-separator" />
              <DatamartReplicationJobTable
                dataSource={jobExecutions}
                total={totalJobExecutions}
                isLoading={isLoadingJobExecutions}
                noItem={noJobExecution}
                onFilterChange={onFilterChange}
              />
            </div>
          </Row>
        </Content>
      </div>
    );
  }
}

export default compose<Props, DatamartReplicationJobListContainerProps>(
  injectIntl,
  withRouter,
  injectDrawer,
  injectNotifications,
)(DatamartReplicationJobListContainer);

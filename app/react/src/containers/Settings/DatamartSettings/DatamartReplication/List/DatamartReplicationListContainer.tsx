import * as React from 'react';
import { compose } from 'recompose';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Button, Row, Layout } from 'antd';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { Index } from '../../../../../utils';
import messages from './messages';
import {
  KEYWORD_SEARCH_SETTINGS,
  PAGINATION_SEARCH_SETTINGS,
} from '../../../../../utils/LocationSearchHelper';
import DatamartReplicationTable from './DatamartReplicationTable';
import { injectDrawer } from '../../../../../components/Drawer';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import { DatamartReplicationResourceShape } from '../../../../../models/settings/settings';
import { DatamartReplicationRouteMatchParam } from '../Edit/domain';

const { Content } = Layout;

export const DATAMART_REPLICATION_SEARCH_SETTINGS = [
  ...KEYWORD_SEARCH_SETTINGS,
  ...PAGINATION_SEARCH_SETTINGS,
];

interface DatamartReplicationListContainerProps {
  replications: DatamartReplicationResourceShape[];
  isLoadingReplications: boolean;
  totalReplications: number;
  noReplication: boolean;
  onFilterChange: (newFilter: Index<string | number>) => void;
  deleteReplication: (resource: DatamartReplicationResourceShape) => void;
  updateReplication: (resource: DatamartReplicationResourceShape, status: boolean) => void;
  lastExecutionIsRunning: boolean;
}

type Props = DatamartReplicationListContainerProps &
  RouteComponentProps<DatamartReplicationRouteMatchParam> &
  InjectedNotificationProps &
  InjectedIntlProps &
  InjectedDrawerProps;

class DatamartReplicationListContainer extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {
      datasource: [],
      total: 0,
      isLoading: true,
      noItem: false,
    };
  }

  buildNewActionElement = () => {
    const onClick = () => {
      const {
        history,
        match: {
          params: { datamartId, organisationId },
        },
      } = this.props;
      history.push({
        pathname: `/v2/o/${organisationId}/settings/datamart/datamart_replication/create`,
        state: {
          datamartId: datamartId,
        },
      });
    };
    return (
      <Button key={messages.newDatamartReplication.id} type='primary' onClick={onClick}>
        <FormattedMessage {...messages.newDatamartReplication} />
      </Button>
    );
  };

  render() {
    const {
      isLoadingReplications,
      totalReplications,
      replications,
      noReplication,
      onFilterChange,
      deleteReplication,
      updateReplication,
      lastExecutionIsRunning,
    } = this.props;

    return (
      <div className='ant-layout'>
        <Content className='mcs-content-container'>
          <Row className='mcs-table-container'>
            <div>
              <div className='mcs-card-header mcs-card-title'>
                <span className='mcs-card-title'>
                  <FormattedMessage {...messages.datamartReplications} />
                </span>
                <span className='mcs-card-button mcs-replicationNew_button'>
                  {this.buildNewActionElement()}
                </span>
              </div>
              <hr className='mcs-separator' />
              <DatamartReplicationTable
                dataSource={replications}
                total={totalReplications}
                isLoading={isLoadingReplications}
                noItem={noReplication}
                onFilterChange={onFilterChange}
                deleteReplication={deleteReplication}
                updateReplication={updateReplication}
                lastExecutionIsRunning={lastExecutionIsRunning}
              />
            </div>
          </Row>
        </Content>
      </div>
    );
  }
}

export default compose<Props, DatamartReplicationListContainerProps>(
  injectIntl,
  withRouter,
  injectDrawer,
  injectNotifications,
)(DatamartReplicationListContainer);

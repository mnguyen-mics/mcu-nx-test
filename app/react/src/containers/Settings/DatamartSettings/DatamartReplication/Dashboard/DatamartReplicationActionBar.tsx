import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Button, Icon, Dropdown, Modal, Menu } from 'antd';
import { compose } from 'recompose';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import injectNotifications from '../../../../Notifications/injectNotifications';
import ActionBar from '../../../../../components/ActionBar';
import { McsIcon } from '../../../../../components';
import { messages } from '../List/messages';
import { DatamartReplicationResourceShape } from '../../../../../models/settings/settings';
import { ClickParam } from 'antd/lib/menu';

interface State {
  isLoading: boolean;
}

interface DatamartReplicationDashboardProps {
  item?: DatamartReplicationResourceShape;
  deleteReplication: (id: string) => void;
}

type Props = DatamartReplicationDashboardProps &
  InjectedIntlProps &
  RouteComponentProps<{
    organisationId: string;
    datamartId: string;
    datamartReplicationId: string;
  }>;

class DatamartReplicationDashboard extends React.Component<Props, State> {
  buildMenu = () => {
    const {
      item,
      deleteReplication,
      intl: { formatMessage },
    } = this.props;

    const handleDeleteReplication = (replicationId: string) => {
      Modal.confirm({
        title: formatMessage(messages.archiveReplicationModalTitle),
        content: formatMessage(messages.archiveReplicationModalContent),
        iconType: 'exclamation-circle',
        okText: formatMessage(messages.archiveReplicationModalOk),
        cancelText: formatMessage(messages.archiveReplicationModalCancel),
        onOk() {
          return deleteReplication(replicationId);
        },
      });
    };

    const onClick = (event: ClickParam) => {
      switch (event.key) {
        case 'DELETE':
          return item && item.id && handleDeleteReplication(item.id);
      }
    };

    return (
      <Menu onClick={onClick}>
        <Menu.Item key="DELETE">
          <FormattedMessage {...messages.deleteDatamartReplication} />
        </Menu.Item>
      </Menu>
    );
  };

  editDatamartReplication = () => {
    const {
      location,
      history,
      match: {
        params: { organisationId, datamartId, datamartReplicationId },
      },
    } = this.props;

    const editUrl = `/v2/o/${organisationId}/settings/datamart/${datamartId}/datamart_replication/${datamartReplicationId}/edit`;
    history.push({
      pathname: editUrl,
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  render() {
    const {
      match: {
        params: { organisationId, datamartId },
      },
      item,
      intl: { formatMessage },
    } = this.props;

    const menu = this.buildMenu();

    const breadcrumbPaths = [
      {
        name: formatMessage(messages.datamartReplications),
        path: `/v2/o/${organisationId}/settings/datamart/my_datamart/${datamartId}`,
      },
      { name: item && item.name ? item.name : '' },
    ];

    return (
      <ActionBar paths={breadcrumbPaths}>
        <Button onClick={this.editDatamartReplication}>
          <McsIcon type="pen" />
          <FormattedMessage {...messages.editDatamartReplication} />
        </Button>

        <Dropdown overlay={menu} trigger={['click']}>
          <Button>
            <Icon type="ellipsis" />
          </Button>
        </Dropdown>
      </ActionBar>
    );
  }
}

export default compose<Props, DatamartReplicationDashboardProps>(
  withRouter,
  injectIntl,
  injectNotifications,
)(DatamartReplicationDashboard);

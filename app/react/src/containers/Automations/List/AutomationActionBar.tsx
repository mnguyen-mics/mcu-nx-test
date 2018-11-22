import React from 'react';
import { Button } from 'antd';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import {
  FormattedMessage,
  InjectedIntlProps,
  injectIntl,
} from 'react-intl';
import { Actionbar } from '../../Actionbar';
import { McsIcon } from '../../../components';
import { compose } from 'recompose';
import Menu from 'antd/lib/menu';
import { ExtendedTableRowSelection } from '../../../components/TableView/TableView';
import { AutomationStatus } from '../../../models/automations/automations';
import { PaginationSearchSettings, KeywordSearchSettings } from '../../../utils/LocationSearchHelper';
import injectNotifications, { InjectedNotificationProps } from '../../Notifications/injectNotifications';
import Dropdown from 'antd/lib/dropdown/dropdown';
import messages from './messages';
import Slider from '../../../components/Transition/Slide';
import withTranslations from '../../Helpers/withTranslations';
import { injectDrawer } from '../../../components/Drawer';


interface AutomationActionbarProps {
  organisationId: string;
  rowSelection: ExtendedTableRowSelection;
  multiEditProps: {
    visible: boolean;
    handleOk: () => any;
    handleCancel: () => void;
    handleStatusAction: (status: AutomationStatus) => void;
  };
} 

export interface FilterParams
extends PaginationSearchSettings,
KeywordSearchSettings {
  statuses: AutomationStatus[];
}

type JoinedProps = AutomationActionbarProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }>;

interface AutomationActionbarState {
  exportIsRunning: boolean;
  allAutomationsActivated: boolean;
  allAutomationsPaused: boolean;
}

class AutomationActionBar extends React.Component<JoinedProps, AutomationActionbarState> {
  
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      exportIsRunning: false,
      allAutomationsActivated: false,
      allAutomationsPaused: false,
    };
  }

  buildMenu = () => {
    const {
      multiEditProps: { handleStatusAction },
    } = this.props;
    const onClick = (event: any) => {
      switch (event.key) {
        case 'pause':
          return handleStatusAction('PAUSED');
        case 'activate':
          return handleStatusAction('ACTIVE');
        default:
          break;
      }
    };

    return (
      <Menu onClick={onClick}>
        <Menu.Item key="pause">
          <FormattedMessage {...messages.pauseAll} />
        </Menu.Item>
        <Menu.Item key="activate">
          <FormattedMessage {...messages.activeAll} />
        </Menu.Item>
      </Menu>
    );
  };
  
  render(){
    const { 
      organisationId, 
      intl,
      rowSelection: { selectedRowKeys },
    } = this.props

    const hasSelected = !!(selectedRowKeys && selectedRowKeys.length > 0);

    const breadcrumbPaths = [{
      name: intl.formatMessage(messages.automationListTitle),
      url: `/v2/o/${organisationId}/automations/list`,
    }];

    const buildActionElement = () => {
      return (
        <Dropdown overlay={this.buildMenu()} trigger={['click']}>
          <Button className="button-glow">
            <McsIcon type="chevron" />
            <FormattedMessage {...messages.setStatus} />
          </Button>
        </Dropdown>
      );
    };
    
    return (
      <Actionbar path={breadcrumbPaths}>
        <Link to={`/v2/o/${organisationId}/automations/create`}>
          <Button className="mcs-primary" type="primary">
            <McsIcon type="plus" /> <FormattedMessage id="NEW_AUTOMATION" />
          </Button>
        </Link>
        <Slider
          toShow={hasSelected}
          horizontal={true}
          content={buildActionElement()}
        />
      </Actionbar>
    );
  }
  
}

export default compose<JoinedProps, AutomationActionbarProps>(
  withRouter,
  withTranslations,
  injectDrawer,
  injectNotifications,
  injectIntl,
)(AutomationActionBar);

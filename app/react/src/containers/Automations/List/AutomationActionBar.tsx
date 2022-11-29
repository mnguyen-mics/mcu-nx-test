import React from 'react';
import { Button } from 'antd';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { FormattedMessage, WrappedComponentProps, injectIntl } from 'react-intl';
import { Actionbar, McsIcon, Slide } from '@mediarithmics-private/mcs-components-library';
import { compose } from 'recompose';
import Menu from 'antd/lib/menu';
import { AutomationStatus } from '../../../models/automations/automations';
import {
  PaginationSearchSettings,
  KeywordSearchSettings,
} from '../../../utils/LocationSearchHelper';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import Dropdown from 'antd/lib/dropdown/dropdown';
import messages from './messages';

interface AutomationActionbarProps {
  organisationId: string;
  multiEditProps: {
    visible: boolean;
    handleStatusAction: (status: AutomationStatus) => void;
  };
}

export interface FilterParams extends PaginationSearchSettings, KeywordSearchSettings {
  statuses: AutomationStatus[];
}

type JoinedProps = AutomationActionbarProps &
  WrappedComponentProps &
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
      <Menu onClick={onClick} className='mcs-menu-antd-customized'>
        <Menu.Item key='pause'>
          <FormattedMessage {...messages.pauseAll} />
        </Menu.Item>
        <Menu.Item key='activate'>
          <FormattedMessage {...messages.activeAll} />
        </Menu.Item>
      </Menu>
    );
  };

  render() {
    const {
      organisationId,
      intl,
      multiEditProps: { visible },
    } = this.props;

    const breadcrumbPaths = [
      <span className='mcs-pathItem' key='automationListBreadcrumb'>
        <Link key='1' to={`/v2/o/${organisationId}/automations`}>
          {intl.formatMessage(messages.automationListTitle)}
        </Link>
      </span>,
    ];

    const buildActionElement = () => {
      return (
        <Dropdown overlay={this.buildMenu()} trigger={['click']}>
          <Button className='button-glow'>
            <McsIcon type='chevron' />
            <FormattedMessage {...messages.setStatus} />
          </Button>
        </Dropdown>
      );
    };

    return (
      <Actionbar pathItems={breadcrumbPaths}>
        <Link to={`/v2/o/${organisationId}/automation-builder`}>
          <Button className='mcs-primary' type='primary'>
            <McsIcon type='plus' />{' '}
            <FormattedMessage
              id='automations.list.actionbar.newAutomation'
              defaultMessage='New Automation'
            />
          </Button>
        </Link>
        <Slide toShow={visible} horizontal={true} content={buildActionElement()} />
      </Actionbar>
    );
  }
}

export default compose<JoinedProps, AutomationActionbarProps>(
  withRouter,
  injectNotifications,
  injectIntl,
)(AutomationActionBar);

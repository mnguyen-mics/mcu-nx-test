import * as React from 'react';
import { Button, Icon, Menu, Modal } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { Dropdown } from '../../../../components/PopupContainers';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';
import withTranslations, {
  TranslationProps,
} from '../../../Helpers/withTranslations';
import { GoalResource } from '../../../../models/goal/index';
import modalMessages from '../../../../common/messages/modalMessages';
import { Actionbar } from '../../../Actionbar';
import McsIcon from '../../../../components/McsIcon';
import log from '../../../../utils/Logger';
import messages from './messages';
import GoalService from '../../../../services/GoalService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';

interface ExportActionbarProps {
  goal?: GoalResource;
  fetchGoal: (id: string) => any
}

interface ExportActionbarState {
  exportIsRunning: boolean;
}

type JoinedProps = ExportActionbarProps &
  RouteComponentProps<{ organisationId: string; goalId: string }> &
  InjectedIntlProps &
  InjectedNotificationProps &
  TranslationProps;

class ExportsActionbar extends React.Component<
  JoinedProps,
  ExportActionbarState
> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      exportIsRunning: false,
    };
  }

  editCampaign = () => {
    const {
      location,
      history,
      match: {
        params: { organisationId, goalId },
      },
    } = this.props;

    const editUrl = `/v2/o/${organisationId}/campaigns/goals/${goalId}/edit`;
    history.push({
      pathname: editUrl,
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  changeCampaignStatus = () => {
    const {
      fetchGoal,
      goal,
      notifyError
    } = this.props;
    if (goal) {
      const promise = goal.status === 'ACTIVE' ? GoalService.updateGoal(goal.id, { status: 'PAUSED' }) : GoalService.updateGoal(goal.id, { status: 'ACTIVE' })
      return promise.then(res => {
        return fetchGoal(goal.id)
      })
      .catch(err => {
        return notifyError(err)
      })
    }
    return;
  }

  render() {
    const {
      match: {
        params: { organisationId },
      },
      goal,
      intl,
    } = this.props;

    const menu = this.buildMenu();

    const breadcrumbPaths = [
      {
        name: intl.formatMessage(messages.goals),
        url: `/v2/o/${organisationId}/campaigns/goals`,
      },
      { name: goal && goal.name ? goal.name : '' },
    ];

    return (
      <Actionbar path={breadcrumbPaths}>
        {goal && <Button type="primary" className="mcs-primary" onClick={this.changeCampaignStatus}>
            {goal.status === 'ACTIVE' ? <div><McsIcon type="pause" /><FormattedMessage {...messages.pause} /></div> : <div><McsIcon type="play" /><FormattedMessage {...messages.activate} /></div> }
        </Button>}
        <Button onClick={this.editCampaign}>
          <McsIcon type="pen" />
          <FormattedMessage {...messages.edit} />
        </Button>

        <Dropdown overlay={menu} trigger={['click']}>
          <Button>
            <Icon type="ellipsis" />
          </Button>
        </Dropdown>
      </Actionbar>
    );
  }

  buildMenu = () => {
    const {
      goal,
      history,
      notifyError,
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
    } = this.props;

    const handleArchiveGoal = (displayCampaignId: string) => {
      if (goal) {
        Modal.confirm({
          title: formatMessage(messages.archiveGoalModalTitle),
          content: formatMessage(messages.archiveGoalModalBody),
          iconType: 'exclamation-circle',
          okText: formatMessage(modalMessages.confirm),
          cancelText: formatMessage(modalMessages.cancel),
          onOk() {
            return GoalService.updateGoal(goal.id, {...goal, archived: true})
              .then(() => {
                const editUrl = `/v2/o/${organisationId}/campaigns/goals`;
                history.push({
                  pathname: editUrl,
                  state: { from: `${location.pathname}${location.search}` },
                });
              })
              .catch(err => {
                notifyError(err);
              });
          },
        });
      }
    };

    const onClick = (event: any) => {
      if (goal)
        switch (event.key) {
          case 'ARCHIVED':
            return handleArchiveGoal(goal.id);
          default:
            return () => {
              log.error('onclick error');
            };
        }
    };

    return (
      <Menu onClick={onClick}>
        <Menu.Item key="ARCHIVED">
          <FormattedMessage {...messages.archive} />
        </Menu.Item>
      </Menu>
    );
  };
}

export default compose<JoinedProps, ExportActionbarProps>(
  withRouter,
  injectIntl,
  withTranslations,
  injectNotifications,
)(ExportsActionbar);

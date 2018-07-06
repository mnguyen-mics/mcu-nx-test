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
  object?: GoalResource;
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

  render() {
    const {
      match: {
        params: { organisationId },
      },
      object,
      intl,
    } = this.props;

    const menu = this.buildMenu();

    const breadcrumbPaths = [
      {
        name: intl.formatMessage(messages.goals),
        url: `/v2/o/${organisationId}/campaigns/goals`,
      },
      { name: object && object.name ? object.name : '' },
    ];

    return (
      <Actionbar path={breadcrumbPaths}>
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
      object,
      history,
      notifyError,
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
    } = this.props;

    const handleDeleteGoal = (displayCampaignId: string) => {
      if (object) {
        Modal.confirm({
          title: formatMessage(messages.deleteGoalModalTitle),
          content: formatMessage(messages.deleteGoalModalBody),
          iconType: 'exclamation-circle',
          okText: formatMessage(modalMessages.confirm),
          cancelText: formatMessage(modalMessages.cancel),
          onOk() {
            return GoalService.deleteGoal(object.id)
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
      if (object)
        switch (event.key) {
          case 'ARCHIVED':
            return handleDeleteGoal(object.id);
          default:
            return () => {
              log.error('onclick error');
            };
        }
    };

    return (
      <Menu onClick={onClick}>
        <Menu.Item key="ARCHIVED">
          <FormattedMessage {...messages.delete} />
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

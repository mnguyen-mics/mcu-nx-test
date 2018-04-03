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

interface ExportActionbarProps {
  object?: GoalResource;
  archiveObject: (id: string) => void;
}

interface ExportActionbarState {
  exportIsRunning: boolean;
}

type JoinedProps = ExportActionbarProps &
  RouteComponentProps<{ organisationId: string; goalId: string }> &
  InjectedIntlProps &
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
      match: { params: { organisationId, goalId } },
    } = this.props;

    const editUrl = `/v2/o/${organisationId}/campaigns/goal/${goalId}/edit`;
    history.push({
      pathname: editUrl,
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  render() {
    const { match: { params: { organisationId } }, object, intl } = this.props;

    const menu = this.buildMenu();

    const breadcrumbPaths = [
      { name: intl.formatMessage(messages.goals), url: `/v2/o/${organisationId}/campaigns/goals` },
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
    const { object, archiveObject, intl: { formatMessage } } = this.props;

    const handleArchiveGoal = (displayCampaignId: string) => {
      Modal.confirm({
        title: formatMessage(modalMessages.archiveCampaignConfirm),
        content: formatMessage(modalMessages.archiveCampaignMessage),
        iconType: 'exclamation-circle',
        okText: formatMessage(modalMessages.confirm),
        cancelText: formatMessage(modalMessages.cancel),
        onOk() {
          return archiveObject(displayCampaignId);
        },
        // onCancel() {},
      });
    };

    const onClick = (event: any) => {
      if (object)
        switch (event.key) {
          case 'ARCHIVED':
            return handleArchiveGoal(object.id);
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
)(ExportsActionbar);

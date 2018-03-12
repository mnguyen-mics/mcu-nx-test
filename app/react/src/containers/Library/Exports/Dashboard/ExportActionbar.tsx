import * as React from 'react';
import { Button, Dropdown, Icon, Menu, Modal, message } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';

import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';
import withTranslations, { TranslationProps } from '../../../Helpers/withTranslations';
import { Export } from '../../../../models/exports/exports';
import modalMessages from '../../../../common/messages/modalMessages';
import { Actionbar } from '../../../Actionbar';
import McsIcon from '../../../../components/McsIcon';
import ExportsService from '../../../../services/Library/ExportsService';
import log from '../../../../utils/Logger';
import messages from './messages';

interface ExportActionbarProps {
  exportObject?: Export;
  archiveObject?: any;
  isExportExecutionRunning: boolean;
  onNewExecution: () => void
}

interface ExportActionbarState {
  exportIsRunning: boolean;
}

type JoinedProps =
  ExportActionbarProps &
  RouteComponentProps<{ organisationId: string; exportId: string; }> &
  InjectedIntlProps &
  TranslationProps;


class ExportsActionbar extends React.Component<JoinedProps, ExportActionbarState> {

  constructor(props: JoinedProps) {
    super(props);
    this.state = { exportIsRunning: this.props.isExportExecutionRunning };
  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    const {
      isExportExecutionRunning,
    } = nextProps;

    this.setState({ exportIsRunning: isExportExecutionRunning })
  }
  

  editCampaign = () => {
    const {
      location,
      history,
      match: {
        params: {
          organisationId,
          exportId,
        },
      },
    } = this.props;

    const editUrl = `/${organisationId}/datastudio/exports/${exportId}/edit`;
    history.push({ pathname: editUrl, state : { from: `${location.pathname}${location.search}` } });
  }

  runExecution = () => {
    const {
      intl: {
        formatMessage,
      },
    } = this.props;

    if (this.state.exportIsRunning) {
      message.error(formatMessage(messages.exportRunning));
    } else if (this.props.exportObject) {
      ExportsService.createExecution(this.props.exportObject.id)
        .then(res => this.setState({ exportIsRunning: true }))
        .then(res => this.props.onNewExecution())
    }
    
  }

  render() {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      exportObject,
    } = this.props;


    const menu = this.buildMenu();

    const breadcrumbPaths = [
      { name: 'Exports', url: `/v2/o/${organisationId}/datastudio/exports` },
      { name: exportObject && exportObject.name ? exportObject.name : '' },
    ];

    return (
      <Actionbar path={breadcrumbPaths}>
        <Button className="mcs-primary" type="primary" onClick={this.runExecution}>
          {this.state.exportIsRunning ? <Icon type="loading" spin={true} /> : <McsIcon type="plus" />}
          <FormattedMessage {...messages.newExecution} />
        </Button>

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

 

  duplicateCampaign = () => {
    const {
      location,
      history,
      match: {
        params: {
          organisationId,
          exportId,
        },
      },
    } = this.props;

    const editUrl = `/v2/o/${organisationId}/datastudio/exports`;
    history.push({ pathname: editUrl, state : { from: `${location.pathname}${location.search}`, exportId: exportId } });
  }

  buildMenu = () => {
    const {
      exportObject,
      archiveObject,
      intl: { formatMessage },
    } = this.props;

    const handleArchiveGoal = (displayCampaignId?: string) => {
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
      switch (event.key) {
        case 'ARCHIVED':
          return handleArchiveGoal(exportObject && exportObject.id);
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
  }
}

export default compose<JoinedProps, ExportActionbarProps>(
  withRouter,
  injectIntl,
  withTranslations,
)(ExportsActionbar);

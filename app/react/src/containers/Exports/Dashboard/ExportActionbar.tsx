import * as React from 'react';
import { Button, Icon, Menu, Modal, message } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { Dropdown } from '../../../components/PopupContainers';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';
import { Export } from '../../../models/exports/exports';
import modalMessages from '../../../common/messages/modalMessages';
import Actionbar from '../../../components/ActionBar';
import McsIcon from '../../../components/McsIcon';
import log from '../../../utils/Logger';
import messages, { formatExportProperty } from './messages';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IExportService } from '../../../services/Library/ExportService';
import ResourceTimelinePage, { ResourceTimelinePageProps } from '../../ResourceHistory/ResourceTimeline/ResourceTimelinePage';
import resourceHistoryMessages from '../../ResourceHistory/ResourceTimeline/messages';
import injectDrawer, { InjectedDrawerProps } from '../../../components/Drawer/injectDrawer';

interface ExportActionbarProps {
  exportObject?: Export;
  archiveObject: () => void;
  isExportExecutionRunning: boolean;
  onNewExecution: () => void;
}

interface ExportActionbarState {
  exportIsRunning: boolean;
}

type JoinedProps = ExportActionbarProps &
  RouteComponentProps<{ organisationId: string; exportId: string }> &
  InjectedIntlProps &
  InjectedDrawerProps;

class ExportsActionbar extends React.Component<
  JoinedProps,
  ExportActionbarState
> {
  @lazyInject(TYPES.IExportService)
  private _exportService: IExportService;

  constructor(props: JoinedProps) {
    super(props);
    this.state = { exportIsRunning: this.props.isExportExecutionRunning };
  }

  componentDidUpdate(previousProps: JoinedProps) {
    const { isExportExecutionRunning } = this.props;

    const {
      isExportExecutionRunning: previousIsExportExecutionRunning,
    } = previousProps;

    if (isExportExecutionRunning !== previousIsExportExecutionRunning) {
      this.setState({ exportIsRunning: isExportExecutionRunning });
    }
  }

  editExport = () => {
    const {
      location,
      history,
      match: {
        params: { organisationId, exportId },
      },
    } = this.props;

    const editUrl = `/v2/o/${organisationId}/datastudio/exports/${exportId}/edit`;
    history.push({
      pathname: editUrl,
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  runExecution = () => {
    const {
      intl: { formatMessage },
    } = this.props;

    if (this.state.exportIsRunning) {
      message.error(formatMessage(messages.exportRunning));
    } else if (this.props.exportObject) {
      this._exportService
        .createExecution(this.props.exportObject.id)
        .then(res => this.setState({ exportIsRunning: true }))
        .then(res => this.props.onNewExecution());
    }
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      exportObject,
    } = this.props;

    const menu = this.buildMenu();

    const breadcrumbPaths = [
      { name: 'Exports', path: `/v2/o/${organisationId}/datastudio/exports` },
      { name: exportObject && exportObject.name ? exportObject.name : '' },
    ];

    return (
      <Actionbar paths={breadcrumbPaths}>
        <Button
          className="mcs-primary"
          type="primary"
          onClick={this.runExecution}
        >
          {this.state.exportIsRunning ? (
            <Icon type="loading" spin={true} />
          ) : (
            <McsIcon type="plus" />
          )}
          <FormattedMessage {...messages.newExecution} />
        </Button>

        <Button onClick={this.editExport}>
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
      archiveObject,
      intl: { formatMessage },
    } = this.props;

    const handleArchiveGoal = () => {
      Modal.confirm({
        title: formatMessage(modalMessages.archiveExportConfirm),
        content: formatMessage(modalMessages.archiveExportMessage),
        iconType: 'exclamation-circle',
        okText: formatMessage(modalMessages.confirm),
        cancelText: formatMessage(modalMessages.cancel),
        onOk() {
          return archiveObject();
        },
        // onCancel() {},
      });
    };

    const onClick = (event: any) => {
      const {
        match: {
          params: { organisationId, exportId },
        },
        history,
      } = this.props;
      switch (event.key) {
        case 'ARCHIVED':
          return handleArchiveGoal();
          case 'HISTORY':
          return this.props.openNextDrawer<ResourceTimelinePageProps>(
            ResourceTimelinePage,
            {
              additionalProps: {
                resourceType: 'QUERY_EXPORT',
                resourceId: exportId,
                handleClose: () => this.props.closeNextDrawer(),
                formatProperty: formatExportProperty,
                resourceLinkHelper: {
                  QUERY_EXPORT: {
                    direction: 'CHILD',
                    getType: () => {
                      return (
                        <FormattedMessage
                          {...resourceHistoryMessages.exportResourceType}
                        />
                      );
                    },
                    getName: (id: string) => {
                      return this._exportService
                        .getExport(id)
                        .then(response => {
                          return response.data.name || id;
                        });
                    },
                    goToResource: (id: string) => {
                      history.push(
                        `/v2/o/${organisationId}/datastudio/exports/${id}`,
                      );
                    },
                  },
                },
              },
              size: 'small',
            },
          );
        default:
          return () => {
            log.error('onclick error');
          };
      }
    };

    return (
      <Menu onClick={onClick}>
        <Menu.Item key="HISTORY">
          <FormattedMessage {...messages.history} />
        </Menu.Item>
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
  injectDrawer,
)(ExportsActionbar);

import * as React from 'react';
import { Button, Icon, Menu, Modal, message, Upload, Spin } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { Dropdown } from '../../../components/PopupContainers';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';
import { Import } from '../../../models/imports/imports';
import modalMessages from '../../../common/messages/modalMessages';
import Actionbar from '../../../components/ActionBar';
import McsIcon from '../../../components/McsIcon';
import log from '../../../utils/Logger';
import messages from './messages';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IImportService } from '../../../services/ImportService';
import { UploadFile } from 'antd/lib/upload/interface';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';

const Dragger = Upload.Dragger;

interface ImportActionbarProps {
  importObject?: Import;
  isImportExecutionRunning: boolean;
  onNewExecution: () => void;
}

interface State {
  importIsRunning: boolean;
  importFile?: UploadFile[];
  isModalOpen: boolean;
  isLoading: boolean;
}

type JoinedProps = ImportActionbarProps &
  RouteComponentProps<{
    organisationId: string;
    datamartId: string;
    importId: string;
  }> &
  InjectedIntlProps &
  InjectedNotificationProps;

class ImportsActionbar extends React.Component<JoinedProps, State> {
  @lazyInject(TYPES.IImportService)
  private _importService: IImportService;
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      importIsRunning: this.props.isImportExecutionRunning,
      isModalOpen: false,
      isLoading: false,
    };
  }

  componentDidUpdate(previousProps: JoinedProps) {
    const { isImportExecutionRunning } = this.props;

    const { isImportExecutionRunning: previousIsImportExecutionRunning } = previousProps;

    if (isImportExecutionRunning !== previousIsImportExecutionRunning) {
      this.setState({ importIsRunning: isImportExecutionRunning });
    }
  }

  editImport = () => {
    const {
      location,
      history,
      match: {
        params: { organisationId, datamartId, importId },
      },
    } = this.props;

    const editUrl = `/v2/o/${organisationId}/datastudio/datamart/${datamartId}/imports/${importId}/edit`;
    history.push({
      pathname: editUrl,
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  checkIfFileOK = (file: UploadFile) => {
    const {
      intl: { formatMessage },
    } = this.props;
    // 100Mo
    const isSizeOK = file.size / 1024 / 1024 < 100;
    if (!isSizeOK) {
      message.error(
        `${file.name} ${formatMessage(messages.uploadErrorTooBig)}`,
        3,
      );
      return false;
    }
    return true;
  };

  handleOpenClose = () => {
    this.setState({ isModalOpen: !this.state.isModalOpen, importFile: [] });
  };

  onFileUpdate = (file: any) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (fileLoadedEvent: any) => {
        const textFromFileLoaded = fileLoadedEvent.target.result;
        return resolve(textFromFileLoaded);
      };

      fileReader.readAsText(file, 'UTF-8');
    });
  };

  handleOnImportButton = () => {
    const {
      match: {
        params: { organisationId, datamartId, importId },
      },
      history,
      importObject,
    } = this.props;
    const { importFile } = this.state;
    if (importFile && importObject) {
      this.setState({ isLoading: true });
      const formData = new FormData();

      for (const file of importFile) {
        this.onFileUpdate(file)
          .then(fileContent => {
            const formattedFile = new Blob([fileContent as any], {
              type:
                importObject.mime_type === 'TEXT_CSV'
                  ? 'text/csv'
                  : 'application/x-ndjson',
            });

            formData.append('file', formattedFile, file.name);
            if (importObject.mime_type === 'TEXT_CSV') {
              formData.append('type', 'text/csv');
            }
            if (importObject.mime_type === 'APPLICATION_X_NDJSON') {
              formData.append('type', 'application/x-ndjson');
            }

            this._importService
              .createImportExecution(datamartId, importId, formData)
              .then(item => {
                this.setState({
                  isLoading: false,
                  isModalOpen: false,
                  importFile: [],
                });
                history.push(
                  `/v2/o/${organisationId}/datastudio/datamart/${datamartId}/imports/${importId}`,
                );
              })
              .catch(err => {
                this.setState({ isLoading: false, importFile: [] });
                this.props.notifyError(err);
              });
          })
          .catch(e => {
            this.props.notifyError(e);
          });
      }
    }
  };

  deleteImport = (datamartId: string, importId: string) => {
    return this._importService.deleteImport(datamartId, importId);
  };

  renderModal = () => {
    const {
      intl: { formatMessage },
    } = this.props;

    const { isLoading, isModalOpen, importFile } = this.state;

    const props = {
      name: 'file',
      multiple: true,
      action: '/',
      accept: '.ndjson,.csv',
      beforeUpload: (file: UploadFile, fileList: UploadFile[]) => {
        if (this.checkIfFileOK(file)) {
          this.setState({ importFile: fileList });
          return true;
        }
        return false;
      },
      fileList: importFile,
      onRemove: (file: UploadFile) => {
        if (importFile)
          this.setState({
            importFile: importFile.filter(item => item.uid !== file.uid),
          });
      },
    };

    return (
      <Modal
        title={formatMessage(messages.uploadTitle)}
        visible={isModalOpen}
        onOk={this.handleOnImportButton}
        okText={formatMessage(messages.uploadConfirm)}
        onCancel={this.handleOpenClose}
        confirmLoading={isLoading}
      >
        <Spin spinning={isLoading}>
          <Dragger {...props}>
            <p className="ant-upload-hint">
              {formatMessage(messages.uploadMessage)}
              <br />
              {formatMessage(messages.uploadMessage2)}
            </p>
          </Dragger>
        </Spin>
      </Modal>
    );
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      importObject,
    } = this.props;

    const menu = this.buildMenu();

    const breadcrumbPaths = [
      { name: 'Imports', path: `/v2/o/${organisationId}/datastudio/imports` },
      { name: importObject && importObject.name ? importObject.name : '' },
    ];

    return (
      <Actionbar paths={breadcrumbPaths}>
        {this.renderModal()}
        <Button
          className="mcs-primary"
          type="primary"
          onClick={this.handleOpenClose}
        >
          {this.state.importIsRunning ? (
            <Icon type="loading" spin={true} />
          ) : (
            <McsIcon type="plus" />
          )}
          <FormattedMessage {...messages.newExecution} />
        </Button>

        <Button onClick={this.editImport}>
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
      importObject,
      intl: { formatMessage },
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;

    const handleDeleteImport = (datamartId: string, importId: string) => {
      Modal.confirm({
        title: formatMessage(modalMessages.deleteImportConfirm),
        content: formatMessage(modalMessages.deleteImportMessage),
        iconType: 'exclamation-circle',
        okText: formatMessage(modalMessages.confirm),
        cancelText: formatMessage(modalMessages.cancel),
        onOk: () => {
          this.setState(
            {
              isLoading: true,
            },
            () => {
              this.deleteImport(datamartId, importId)
                .then(res => {
                  this.setState({ isLoading: false });
                  history.push(`/v2/o/${organisationId}/datastudio/imports`);
                })
                .catch(err => {
                  this.setState({ isLoading: false });
                  this.props.notifyError(err);
                });
            },
          );
        },
        // onCancel() {},
      });
    };

    const onClick = (event: any) => {
      if (importObject) {
        switch (event.key) {
          case 'DELETE':
            return handleDeleteImport(
              importObject.datamart_id,
              importObject.id,
            );
          default:
            return () => {
              log.error('onclick error');
            };
        }
      }
    };

    return (
      <Menu onClick={onClick}>
        <Menu.Item key="DELETE">
          <FormattedMessage {...messages.delete} />
        </Menu.Item>
      </Menu>
    );
  };
}

export default compose<JoinedProps, ImportActionbarProps>(
  withRouter,
  injectIntl,
  injectNotifications,
)(ImportsActionbar);

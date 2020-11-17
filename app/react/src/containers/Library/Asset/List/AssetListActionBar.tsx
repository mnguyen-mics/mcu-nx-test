import * as React from 'react';
import { Button, Modal, Upload, message, Spin } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';

import { Actionbar, McsIcon } from '@mediarithmics-private/mcs-components-library';
import messages from './messages';
import { UploadFile } from 'antd/lib/upload/interface';
import { Filters } from '../../../../components/ItemList';
import {
  updateSearch,
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
} from '../../../../utils/LocationSearchHelper';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IAssetFileService } from '../../../../services/Library/AssetFileService';

const maxFileSize = 200 * 1024;

const Dragger = Upload.Dragger;

interface RouterProps {
  organisationId: string;
}

interface AssetsActionbarProps {
  onUploadDone: (organisationId: string, filter: Filters) => void;
}

interface AssetsActionbarState {
  isModalOpen: boolean;
  fileList: UploadFile[];
  isLoading: boolean;
}

type Props = RouteComponentProps<RouterProps> &
  InjectedIntlProps &
  InjectedNotificationProps &
  AssetsActionbarProps;

class AssetsActionbar extends React.Component<Props, AssetsActionbarState> {
  @lazyInject(TYPES.IAssetFileService)
  private _assetFileService: IAssetFileService;
  constructor(props: Props) {
    super(props);
    this.state = {
      isModalOpen: false,
      fileList: [],
      isLoading: false,
    };
  }

  handleOpenClose = () => {
    this.setState({ isModalOpen: !this.state.isModalOpen, fileList: [] });
  };

  handleOnUpload = () => {
    const {
      match: {
        params: { organisationId },
      },
      history,
      location: { pathname, search },
    } = this.props;
    this.setState({ isLoading: true });
    return Promise.all(
      this.state.fileList.map(item => {
        const formData = new FormData(); /* global FormData */
        formData.append('file', item as any, item.name);
        return this._assetFileService.uploadAssetsFile(
          organisationId,
          formData,
        );
      }),
    )
      .then(item => {
        this.setState({ isLoading: false, isModalOpen: false, fileList: [] });
        const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);
        if (filter.currentPage !== 1) {
          history.replace({
            pathname: pathname,
            search: updateSearch(
              search,
              {
                currentPage: 1,
                pageSize: 10,
              },
              PAGINATION_SEARCH_SETTINGS,
            ),
          });
        } else {
          this.props.onUploadDone(this.props.match.params.organisationId, {
            currentPage: 1,
            pageSize: 10,
          });
        }
      })
      .catch(err => {
        this.setState({ isLoading: false, fileList: [] });
        this.props.notifyError(err);
      });
  };

  checkIfSizeOK = (file: UploadFile) => {
    const {
      intl: { formatMessage },
    } = this.props;
    const isSizeOK = file.size < maxFileSize;
    if (!isSizeOK) {
      message.error(`${file.name} ${formatMessage(messages.uploadError)}`, 2);
    }
  };

  filterFileList = (fileList: UploadFile[]) => {
    return fileList.filter(item => {
      return item.size < maxFileSize;
    });
  };

  renderModal = () => {
    const {
      intl: { formatMessage },
    } = this.props;

    const props = {
      name: 'file',
      multiple: true,
      action: '/',
      accept: '.jpg,.jpeg,.png,.gif,.svg',
      beforeUpload: (file: UploadFile, fileList: UploadFile[]) => {
        this.checkIfSizeOK(file);
        const newFileList = [
          ...this.state.fileList,
          ...this.filterFileList(fileList),
        ];
        this.setState({ fileList: newFileList });
        return false;
      },
      fileList: this.state.fileList,
      onRemove: (file: UploadFile) => {
        this.setState({
          fileList: this.state.fileList.filter(item => item.uid !== file.uid),
        });
      },
    };

    return (
      <Modal
        title={formatMessage(messages.newAsset)}
        visible={this.state.isModalOpen}
        onOk={this.handleOnUpload}
        okText={formatMessage(messages.uploadButton)}
        onCancel={this.handleOpenClose}
        confirmLoading={this.state.isLoading}
      >
        <Spin spinning={this.state.isLoading}>
          <Dragger {...props}>
            <p className="ant-upload-text">
              {formatMessage(messages.uploadTitle)}
            </p>
            <p className="ant-upload-hint">
              {formatMessage(messages.uploadMessage)}
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
      intl: { formatMessage },
    } = this.props;

    const breadcrumbPaths = [
      {
        name: formatMessage(messages.assets),
        path: `/v2/o/${organisationId}/library/assets`,
      },
    ];

    return (
      <Actionbar paths={breadcrumbPaths}>
        {this.renderModal()}
        <Button
          className="mcs-primary"
          type="primary"
          onClick={this.handleOpenClose}
        >
          <McsIcon type="plus" /> <FormattedMessage {...messages.newAsset} />
        </Button>
      </Actionbar>
    );
  }
}

export default compose<Props, AssetsActionbarProps>(
  injectIntl,
  withRouter,
  injectNotifications,
)(AssetsActionbar);

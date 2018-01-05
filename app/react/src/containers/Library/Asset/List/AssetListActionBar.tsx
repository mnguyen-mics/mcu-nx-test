import * as React from 'react';
import { Button, Modal, Upload, message } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';

import { Actionbar } from '../../../Actionbar';
import AssetsFilesService from '../../../../services/Library/AssetsFilesService';
import McsIcons from '../../../../components/McsIcons';
import messages from './messages';

import { UploadFile } from 'antd/lib/upload/interface';
import { notifyError } from '../../../../state/Notifications/actions';

const Dragger = Upload.Dragger;

interface RouterProps {
  organisationId: string;
}

interface AssetsActionbarState {
  isModalOpen: boolean;
  fileList: UploadFile[];
  isLoading: boolean;
}

type Props = RouteComponentProps<RouterProps> & InjectedIntlProps;

class AssetsActionbar extends React.Component<Props, AssetsActionbarState> {

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
  }

  handleOnUpload = () => {
    const {
      match: {
        params: {
          organisationId,
        },
      },
    } = this.props;
    this.setState({ isLoading: true });
    return Promise.all(this.state.fileList.map(item => {
      const formData = new FormData(); /* global FormData */
      formData.append('file', item as any, item.name);
      return AssetsFilesService.uploadAssetsFile(organisationId, formData);
    })).then(item => {
      this.setState({ isLoading: false, isModalOpen: false, fileList: [] });
      this.props.history.push(`${this.props.location.pathname}${this.props.location.search}`);
    }).catch(err => notifyError(err));
  }

  checkIfSizeOK = (fileList: UploadFile[]) => {
    fileList.forEach(file => {
      const isSizeOK = file.size < 200 * 1024;
      if (!isSizeOK) {
        message.error(`${file.name} is above 200kB!`, 2);
      }
    });
    return fileList.filter(file => {
      const isSizeOK = file.size < 200 * 1024;

      return isSizeOK;
    });
  }

  renderModal = () => {
    const props = {
      name: 'file',
      multiple: true,
      action: '/',
      accept: '.jpg,.jpeg,.png,.gif',
      beforeUpload: (file: UploadFile, fileList: UploadFile[]) => {
        const newFiles = this.checkIfSizeOK(fileList)];
        this.setState({ fileList: [ ...this.state.fileList, ...newFiles });
        return false;
      },
      fileList: this.state.fileList,
      onRemove: (file: UploadFile) => {
        this.setState({ fileList: this.state.fileList.filter(item => item.uid !== file.uid) });
      },
    };

    return (
      <Modal
        title="Basic Modal"
        visible={this.state.isModalOpen}
        onOk={this.handleOnUpload}
        okText="Upload"
        onCancel={this.handleOpenClose}
      >
        <Dragger {...props}>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">
          You can upload one or multiple file at the time.
          You can only upload image files with the following format .jpg,.jpeg,.png,.gif</p>
      </Dragger>
      </Modal>
    );
  }

  render() {

    const {
      match: {
        params: {
          organisationId,
        },
      },
      intl: {
        formatMessage,
      },
    } = this.props;

    const breadcrumbPaths = [{ name: formatMessage(messages.assets), url: `/v2/o/${organisationId}/library/assets` }];

    return (
      <Actionbar path={breadcrumbPaths}>
        {this.renderModal()}
        <Button className="mcs-primary" type="primary" onClick={this.handleOpenClose}>
          <McsIcons type="plus" /> <FormattedMessage {...messages.newAsset} />
        </Button>
      </Actionbar>
    );

  }

}

export default compose(
  injectIntl,
  withRouter,
)(AssetsActionbar);

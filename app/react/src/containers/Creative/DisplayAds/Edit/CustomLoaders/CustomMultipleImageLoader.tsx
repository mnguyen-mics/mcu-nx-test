import * as React from 'react';
import { Upload, message, Modal, Input } from 'antd';
import { UploadProps } from 'antd/lib/upload';
import { UploadFile, UploadChangeParam } from 'antd/lib/upload/interface';
import { FormUploadProps } from '../../../../../components/Form/FormUpload';
import { WrappedFieldArrayProps } from 'redux-form';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { ReduxFormChangeProps } from '../../../../../utils/FormHelper';
import { compose } from 'recompose';
import { Button, McsIcon } from '@mediarithmics-private/mcs-components-library';
import { MultipleImageField } from '../domain';

const messages = defineMessages({
  uploadMessage: {
    id: 'creative.create.loader.upload.message',
    defaultMessage:
      'is above 200kB! You can only upload image files with the following format .jpg,.jpeg,.png,.gif,.svg with a maximum size of 200kB',
  },
  uploadText: {
    id: 'creative.create.loader.upload.text',
    defaultMessage: 'click here to upload one or several images',
  },
  editName: {
    id: 'creative.create.loader.upload.edit.name',
    defaultMessage: 'Edit Name',
  },
  modalTitle: {
    id: 'creative.create.loader.upload.modal.title',
    defaultMessage: 'Edit Creative Name',
  },
});

export interface CustomMultipleImageLoaderProps extends ReduxFormChangeProps {
  inputProps?: UploadProps;
}

const maxFileSize = 200 * 1024;

type JoinedProps = FormUploadProps &
  WrappedFieldArrayProps<MultipleImageField> &
  InjectedIntlProps &
  CustomMultipleImageLoaderProps;

interface State {
  selectedFile?: MultipleImageField;
  inputValue: string;
  modalVisible: boolean;
}

class CustomMultipleImageLoader extends React.Component<JoinedProps, State> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      modalVisible: false,
      inputValue: '',
    };
  }

  renderImageEditor = (file: MultipleImageField) => {
    const { intl } = this.props;

    const url = URL.createObjectURL(file.file);
    const onClick = () => {
      this.removeItem(file.file.uid);
    };

    const openModal = () => {
      this.setState({
        modalVisible: true,
        selectedFile: file,
        inputValue: file.name,
      });
    };
    return (
      <div className="content">
        <div className="image">
          <img src={`${url}`} />
        </div>
        <div className="text">{file.name}</div>
        <div className="overlay">
          <div>
            <div className="tets">
              <Button onClick={onClick}>
                <McsIcon type="close" />
              </Button>
            </div>
            <div>
              <Button onClick={openModal}>
                {intl.formatMessage(messages.editName)}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  removeItem = (id: string) => {
    const { fields, formChange } = this.props;

    const newFields: MultipleImageField[] = [];
    fields.getAll().forEach(f => {
      if (f.file.uid !== id) {
        newFields.push(f);
      }
    });
    formChange((fields as any).name, newFields);
  };

  handleOk = () => {
    const { fields, formChange } = this.props;

    const newFields: MultipleImageField[] = [];
    fields.getAll().forEach(f => {
      if (
        this.state.selectedFile &&
        f.file.uid === this.state.selectedFile.file.uid
      ) {
        newFields.push({
          file: this.state.selectedFile.file,
          name: this.state.inputValue,
        });
      } else {
        newFields.push(f);
      }
    });
    formChange((fields as any).name, newFields);
    this.setState({
      modalVisible: false,
      selectedFile: undefined,
      inputValue: '',
    });
  };

  handleCancel = () => {
    this.setState({
      modalVisible: false,
      selectedFile: undefined,
      inputValue: '',
    });
  };

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ inputValue: e.target.value });
  };

  render() {
    const { fields, formChange, inputProps, disabled, intl } = this.props;

    const uploadDetailProps: Partial<UploadProps> = {
      action: '/',
      beforeUpload: (uploadFile: UploadFile) => {
        return false;
      },
      onChange: (info: UploadChangeParam) => {
        if (!disabled) {
          const newFields = fields.getAll();
          if (info.file.size <= maxFileSize) {
            newFields.push({
              name: info.file.name,
              file: info.file,
            });
          } else {
            message.error(
              `${info.file.name} ${intl.formatMessage(messages.uploadMessage)}`,
              2,
            );
          }

          formChange((fields as any).name, newFields);
        }
      },
      showUploadList: false,
      accept: 'image/*',
      multiple: inputProps && inputProps.multiple ? inputProps.multiple : false,
    };

    const fileList = fields.getAll();

    return (
      <div className="mcs-custom-loader image-loader">
        <div className="square-container">
          {fileList &&
            fileList.map(f => {
              return (
                <div key={f.file.uid} className="square">
                  {this.renderImageEditor(f)}
                </div>
              );
            })}

          <div className="square">
            <span className="content">
              <Upload.Dragger
                fileList={fileList.map(f => f.file)}
                {...inputProps}
                {...uploadDetailProps}>
                <div>{intl.formatMessage(messages.uploadText)}</div>
              </Upload.Dragger>
            </span>
          </div>
          <Modal
            title={intl.formatMessage(messages.modalTitle)}
            visible={this.state.modalVisible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}>
            <Input
              value={this.state.inputValue}
              onChange={this.handleInputChange}
            />
          </Modal>
        </div>
      </div>
    );
  }
}

export default compose<JoinedProps, CustomMultipleImageLoaderProps>(injectIntl)(
  CustomMultipleImageLoader,
);

import * as React from 'react';
import { Upload, message } from 'antd';

import { FormItemProps } from 'antd/lib/form/FormItem';
import { UploadProps, UploadFile } from 'antd/lib/upload/interface';
import { WrappedFieldProps } from 'redux-form';
import { TooltipPropsWithTitle } from 'antd/lib/tooltip';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';

export interface FormDragAndDropProps {
  formItemProps?: FormItemProps;
  inputProps?: UploadProps;
  helpToolTipProps?: TooltipPropsWithTitle;
  maxFileSize: number;
  uploadTitle: FormattedMessage.MessageDescriptor;
  uploadMessage: FormattedMessage.MessageDescriptor;
  uploadError: FormattedMessage.MessageDescriptor;
  fileMasks: string;
}

const Dragger = Upload.Dragger;

type JoinedProps = FormDragAndDropProps & WrappedFieldProps & InjectedIntlProps;

class FormDragAndDrop extends React.Component<JoinedProps> {
  render() {
    const {
      intl: { formatMessage },
      uploadTitle,
      uploadMessage,
      maxFileSize,
      uploadError,
    } = this.props;

    const checkIfSizeOK = (file: UploadFile) => {
      const isSizeOK = file.size && file.size < maxFileSize;
      if (!isSizeOK) {
        message.error(`${file.name} ${formatMessage(uploadError)}`, 2);
      }
    };

    const filterFileList = (fileList: UploadFile[]) => {
      return fileList.filter(item => {
        return item.size && item.size < maxFileSize;
      });
    };

    const builProps = () => {
      const { input, fileMasks } = this.props;
      return {
        name: 'file',
        multiple: true,
        action: '/',
        accept: fileMasks,
        beforeUpload: (file: UploadFile, fileList: UploadFile[]) => {
          checkIfSizeOK(file);
          const newFileList = [...input.value, ...filterFileList(fileList)];
          input.onChange(newFileList);
          return false;
        },
        fileList: input.value.length > 0 ? input.value : undefined,
        onRemove: (file: UploadFile) => {
          input.onChange(input.value.filter((item: UploadFile) => item.uid !== file.uid));
        },
      };
    };

    return (
      <Dragger {...builProps()}>
        <p className='ant-upload-text'>{formatMessage(uploadTitle)}</p>
        <p className='ant-upload-hint'>{formatMessage(uploadMessage)}</p>
      </Dragger>
    );
  }
}

export default injectIntl(FormDragAndDrop);

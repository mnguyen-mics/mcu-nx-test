import * as React from 'react';
import { Upload, Button, Icon } from 'antd';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { UploadProps, UploadFile } from 'antd/lib/upload/interface';
import { WrappedFieldProps } from 'redux-form';
import { TooltipProps } from 'antd/lib/tooltip';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { FormFieldWrapper } from './index';

export interface FormUploadProps {
  formItemProps?: FormItemProps;
  inputProps?: UploadProps;
  helpToolTipProps: TooltipProps;
  buttonText: string;
  noUploadModal?: () => void;
}

type JoinedProps = FormUploadProps & WrappedFieldProps & InjectedIntlProps;

class FormUpload extends React.Component<JoinedProps> {
  static defaultprops = {
    formItemProps: {},
    inputProps: {},
    helpToolTipProps: {},
  };

  state = {
    fileName: '',
    canRemoveFile: false,
  };

  componentDidMount() {
    const { input } = this.props;

    if (input.value.asset_id) {
      input.onChange([input.value]);
      this.changeFileName(input.value.original_file_name);
      this.changeCanRemoveFile(false);
    } else {
      input.onChange([]);
      this.changeCanRemoveFile(true);
    }
  }

  changeCanRemoveFile = (canRemoveFile: boolean) => {
    this.setState({ canRemoveFile: canRemoveFile });
  };

  changeFileName = (fileName: string) => {
    this.setState({ fileName: fileName });
  };

  onRemoveFile = () => {
    const { input } = this.props;
    this.changeFileName('');
    input.onChange([]);
  };

  render() {
    const {
      input,
      meta,
      formItemProps,
      inputProps,
      helpToolTipProps,
    } = this.props;

    let validateStatus = 'success' as
      | 'success'
      | 'warning'
      | 'error'
      | 'validating';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta.touched && meta.warning) validateStatus = 'warning';

    const uploadDetailProps = {
      action: '/',
      beforeUpload: (file: UploadFile) => {
        this.changeFileName(file.name);
        const formData = new FormData(); /* global FormData */
        formData.append('file', file as any, file.name);
        input.onChange([file]);
        return false;
      },
    };

    return (
      <FormFieldWrapper
        help={meta.touched && (meta.warning || meta.error)}
        helpToolTipProps={helpToolTipProps}
        validateStatus={validateStatus}
        {...formItemProps}
      >
        <Upload {...input} {...inputProps} {...uploadDetailProps}>
          <Button
            onClick={
              inputProps && inputProps.disabled
                ? this.props.noUploadModal
                : undefined
            }
          >
            <Icon type="upload" /> {this.props.buttonText}
          </Button>
        </Upload>
      </FormFieldWrapper>
    );
  }
}

export default injectIntl(FormUpload);

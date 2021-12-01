import * as React from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Upload, Button } from 'antd';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { UploadProps, UploadFile, UploadChangeParam } from 'antd/lib/upload/interface';
import { WrappedFieldProps } from 'redux-form';
import { TooltipPropsWithTitle } from 'antd/lib/tooltip';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { FormFieldWrapper } from './index';

export interface FormUploadProps {
  formItemProps?: FormItemProps;
  inputProps?: UploadProps;
  helpToolTipProps?: TooltipPropsWithTitle;
  buttonText: string;
  noUploadModal?: () => void;
  disabled?: boolean;
  small?: boolean;
}

interface State {
  file?: UploadFile;
}

type JoinedProps = FormUploadProps & WrappedFieldProps & InjectedIntlProps;

/**
 * TODO generalize this component as it is too coupled to plugin property type ASSET_FILE
 */
class FormUpload extends React.Component<JoinedProps, State> {
  constructor(props: JoinedProps) {
    super(props);

    let existingFile: UploadFile | undefined;
    if (props.input.value && props.input.value.asset_id) {
      existingFile = {
        uid: props.input.value.asset_id,
        name: props.input.value.original_file_name,
        size: 0,
        type: '',
      };
    }

    this.state = {
      file: existingFile,
    };
  }

  render() {
    const { input, meta, formItemProps, inputProps, helpToolTipProps, disabled, small } =
      this.props;

    const { file } = this.state;

    let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta.touched && meta.warning) validateStatus = 'warning';

    const uploadDetailProps: Partial<UploadProps> = {
      action: '/',
      beforeUpload: (uploadFile: UploadFile) => {
        return false;
      },
      onChange: (info: UploadChangeParam) => {
        if (!(inputProps && inputProps.disabled)) {
          this.setState({ file: info.file });
          input.onChange({ ...input.value, file: info.file });
        }
      },
      onRemove: (uploadFile: UploadFile) => {
        if (!(inputProps && inputProps.disabled)) {
          this.setState({ file: undefined });
          input.onChange(undefined);
        }
      },
    };

    const fileList = file ? [file] : [];

    return (
      <FormFieldWrapper
        help={meta.touched && (meta.warning || meta.error)}
        helpToolTipProps={helpToolTipProps}
        validateStatus={validateStatus}
        small={small}
        {...formItemProps}
      >
        <Upload fileList={fileList} {...inputProps} {...uploadDetailProps} disabled={disabled}>
          <Button onClick={this.props.noUploadModal} disabled={disabled}>
            <UploadOutlined /> {this.props.buttonText}
          </Button>
        </Upload>
      </FormFieldWrapper>
    );
  }
}

export default injectIntl(FormUpload);

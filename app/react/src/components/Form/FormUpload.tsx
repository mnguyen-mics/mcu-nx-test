import * as React from 'react';
import { Form, Upload, Tooltip, Row, Col, Button, Icon } from 'antd';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { UploadProps, UploadFile } from 'antd/lib/upload/interface';
import { WrappedFieldProps } from 'redux-form';
import { TooltipPlacement, TooltipProps } from 'antd/lib/tooltip';
import { isEmpty } from 'lodash';

import McsIcons from '../../components/McsIcons';

const defaultTooltipPlacement: TooltipPlacement = 'right';

export interface FormUploadProps {
  formItemProps?: FormItemProps;
  inputProps?: UploadProps;
  helpToolTipProps: TooltipProps;
  buttonText: string;
}

class FormUpload extends React.Component<FormUploadProps & WrappedFieldProps> {

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
    const {
      input,
    } = this.props;

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
  }

  changeFileName = (fileName: string) => {
    this.setState({ fileName: fileName });
  }

  onRemoveFile = () => {
    const {
      input,
    } = this.props;
    this.changeFileName('');
    input.onChange([]);
  }

  render() {
    const {
      input,
      meta,
      formItemProps,
      inputProps,
      helpToolTipProps,
    } = this.props;

    let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta.touched && meta.warning) validateStatus = 'warning';

    const displayHelpToolTip = !isEmpty(helpToolTipProps);

    const mergedTooltipProps = {
      placement: defaultTooltipPlacement,
      ...helpToolTipProps,
    };

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
      <Form.Item
        help={meta.touched && (meta.warning || meta.error)}
        validateStatus={validateStatus}
        {...formItemProps}
      >
        <Row align="middle" type="flex">
          <Col span={22} >
            <Upload
              {...input}
              {...inputProps}
              {...uploadDetailProps}
            >
              <Button>
                <Icon type="upload" /> {this.props.buttonText}
              </Button>
            </Upload>

          </Col>
          {displayHelpToolTip &&
            <Col span={2} className="field-tooltip">
              <Tooltip {...mergedTooltipProps}>
                <McsIcons type="info" />
              </Tooltip>
            </Col>
          }
        </Row>
      </Form.Item>
    );
  }
}

export default FormUpload;

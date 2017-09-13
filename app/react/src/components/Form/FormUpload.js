import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Upload, Tooltip, Row, Col, Button, Icon } from 'antd';
import { isEmpty } from 'lodash';

import McsIcons from '../../components/McsIcons';

const defaultTooltipPlacement = 'right';

class FormUpload extends Component {

  state = {
    fileName: '',
    canRemoveFile: false,
  }

  componentDidMount() {
    const {
      input
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

  changeCanRemoveFile = (canRemoveFile) => {
    this.setState({ canRemoveFile: canRemoveFile });
  }

  changeFileName = (fileName) => {
    this.setState({ fileName: fileName });
  }

  onRemoveFile = () => {
    const {
      input
    } = this.props;
    this.changeFileName('');
    input.onChange([]);
  }

  render() {
    const { input,
      meta,
      formItemProps,
      inputProps,
      helpToolTipProps,
    } = this.props;

    let validateStatus = '';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta.touched && meta.warning) validateStatus = 'warning';

    const displayHelpToolTip = !isEmpty(helpToolTipProps);

    const mergedTooltipProps = {
      placement: defaultTooltipPlacement,
      ...helpToolTipProps,
    };

    const uploadProps = {
      action: '/',
      beforeUpload: (file) => {
        this.changeFileName(file.name);
        const formData = new FormData(); /* global FormData */
        formData.append('file', file, file.name);
        input.onChange([formData]);

        return false;
      }
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
              id={input.name}
              {...input}
              {...inputProps}
              {...uploadProps}
            >
              <Button>
                <Icon type="upload" /> {inputProps.buttonText}
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
        <Row>
          <Col span={22}>
            {(input && input.value && input.value.length !== 0) ? <Row key={input.uid} className="upload"> {this.state.canRemoveFile ? <button onClick={() => this.onRemoveFile(input.value)} className="mcs-invisible-button close"><McsIcons type="close" /></button> : null}<span className="name">{this.state.fileName}</span></Row> : null}
          </Col>
        </Row>
      </Form.Item>
    );
  }
}

FormUpload.defaultProps = {
  formItemProps: {},
  inputProps: {},
  helpToolTipProps: {},
};

FormUpload.propTypes = {
  input: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  meta: PropTypes.shape({
    error: PropTypes.string,
  }).isRequired,
  formItemProps: PropTypes.shape({
    required: PropTypes.bool,
    label: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.string,
    ]),
    colon: PropTypes.bool,
  }),
  inputProps: PropTypes.shape({
    type: PropTypes.string,
    placeholder: PropTypes.string,
    size: PropTypes.oneOf(['small', 'default', 'large']),
    className: PropTypes.string,
    buttonText: PropTypes.string,
  }),
  helpToolTipProps: PropTypes.shape({
    tile: PropTypes.string,
    placement: PropTypes.oneOf(['top', 'left', 'right', 'bottom',
      'topLeft', 'topRight', 'bottomLeft', 'bottomRight',
      'leftTop', 'leftBottom', 'rightTop', 'rightBottom']),
  }),
};

export default FormUpload;

import * as React from 'react';
import { Row, Col, Alert, Input } from 'antd';
import { McsIcon } from '../../components';
import { AlertProps } from 'antd/lib/alert';
import { McsIconType } from '../McsIcon';
import FormFieldWrapper, { FormFieldWrapperProps } from './FormFieldWrapper';
import { WrappedFieldProps } from 'redux-form';
import { FormInputProps } from './FormInput';

export interface FormAlertInputProps
  extends FormFieldWrapperProps,
    FormInputProps,
    AlertProps {
  name: string;
  message: React.ReactNode;
  iconType: McsIconType;
}

interface State {
  displayWarning: boolean;
  value?: string;
}

type JoinedProps = FormAlertInputProps & WrappedFieldProps;

class FormAlertInput extends React.Component<JoinedProps, State> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      displayWarning: false,
      value: props.input.value,
    };
  }

  warningOnTokenChange = (e: any) => {
    const { value } = this.state;
    this.setState({
      displayWarning: !!value && value !== e.target.value,
    });
  };

  render() {
    const {
      helpToolTipProps,
      formItemProps,
      inputProps,
      message,
      iconType,
      type,
      input,
      meta,
    } = this.props;

    let validateStatus = 'success' as
      | 'success'
      | 'warning'
      | 'error'
      | 'validating';

    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta.touched && meta.warning) validateStatus = 'warning';

    const InputComponent = Input;

    const newInputProps = {
      ...inputProps,
      onKeyUp: this.warningOnTokenChange,
    };

    const { displayWarning } = this.state;
    return (
      <div>
        {displayWarning && (
          <Row>
            <Col offset={4} className="modificationWarning">
              <Row>
                <Col span={15}>
                  <Alert
                    message={
                      <div>
                        <McsIcon type={iconType} />
                        {message}
                      </div>
                    }
                    type={type ? type : 'info'}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        )}
        <br />
        <FormFieldWrapper
          help={meta.touched && (meta.warning || meta.error)}
          helpToolTipProps={helpToolTipProps}
          validateStatus={validateStatus}
          {...formItemProps}
        >
          <InputComponent id={input.name} {...input} {...newInputProps} />
        </FormFieldWrapper>
      </div>
    );
  }
}

export default FormAlertInput;

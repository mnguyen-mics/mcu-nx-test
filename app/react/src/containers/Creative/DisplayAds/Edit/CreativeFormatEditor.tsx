import * as React from 'react';
import { compose } from 'recompose';
import { Input, Select } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { WrappedFieldInputProps } from 'redux-form';

import FormFieldWrapper from '../../../../components/Form/FormFieldWrapper';
import ButtonStyleless from '../../../../components/ButtonStyleless';
import FormSelect from '../../../../components/Form/FormSelect/FormSelect';
import messages from '../Edit/messages';

const Option = Select.Option;

interface CreativeFormatEditorProps {
  formats: string[];
  // input: {
  //   onChange: (type: string) => void;
  //   value?: string;
  // };
  input: WrappedFieldInputProps;
  meta: {
    active: boolean;
    asyncValidating: boolean;
    autofilled: boolean;
    dirty: boolean;
    dispatch: () => void;
    form: string;
    initial: string;
    invalid: boolean;
    pristine: boolean;
    submitFailed: boolean;
    submitting: boolean;
    touched: boolean;
    valid: boolean;
    visited: boolean;
    warning: boolean;
  };
  disabled: boolean;
}

type JoinedProps = CreativeFormatEditorProps & InjectedIntlProps;

class CreativeFormatEditor extends React.Component<JoinedProps> {

  static defaultProps: Partial<JoinedProps> = {
    disabled: false,
  };

  state = { standardFormat: true };

  render() {
    const {
      intl: {
        formatMessage,
      },
      formats,
      input,
      meta,
      disabled,
    } = this.props;
    const { standardFormat } = this.state;

    let validateStatus: 'error' | 'success' | 'warning' | 'validating' = 'success';
    if (meta.invalid) validateStatus = 'error';
    if (meta.warning) validateStatus = 'warning';

    const buttonLabel = formatMessage(messages[standardFormat
      ? 'creativeCreationGeneralFormatFieldButtonCustom'
      : 'creativeCreationGeneralFormatFieldButtonStandard'
    ]);

    const buttonOnClick = () => {
      this.setState({ standardFormat: !standardFormat });
    };

    /* For custom format only */
    const dimensions = input.value ? input.value.split('x') : '';
    const width = dimensions[0] ? dimensions[0] : '';
    const height = dimensions[1] ? dimensions[1] : '';

    const onDimensionChange = (type: string) => (e: React.FormEvent<HTMLButtonElement>) => {
      // const { value } = e.target;
      const isDimension = !input.value || (/^\d+$/i.test(input.value) && input.value.length < 15);

      if (isDimension) {
        input.onChange(type === 'width' ? `${input.value}x${height}` : `${width}x${input.value}`);
      }
    };

    return (
      <FormFieldWrapper
        // help={meta.warning || meta.error}
        helpToolTipProps={{
          title: formatMessage(messages.creativeCreationGeneralFormatFieldHelper),
        }}
        label={formatMessage(messages.creativeCreationGeneralFormatFieldTitle)}
        required={true}
        validateStatus={validateStatus}
      >
        <div className="creative-format">
          <div className="field">
            {standardFormat
              ? (
                <FormSelect input={input} disabled={disabled}>
                  {formats.map(option => (
                    <Option key={option} value={option}>{option}</Option>
                  ))}
                </FormSelect>
              )
              : (
                <div className="custom">
                  <div className="input">
                    <Input
                      value={width}
                      onChange={onDimensionChange('width')}
                      disabled={disabled}
                    />
                  </div>
                  <div className="separator">x</div>
                  <div className="input">
                    <Input
                      value={height}
                      onChange={onDimensionChange('height')}
                      disabled={disabled}
                    />
                  </div>
                </div>
              )
            }
          </div>

          <div className="button">
            <ButtonStyleless
              className="clickable-on-hover"
              onClick={buttonOnClick}
            >{buttonLabel}
            </ButtonStyleless>
          </div>
        </div>
      </FormFieldWrapper>
    );
  }
}

export default compose<JoinedProps, CreativeFormatEditorProps>(
    injectIntl,
  )(CreativeFormatEditor);

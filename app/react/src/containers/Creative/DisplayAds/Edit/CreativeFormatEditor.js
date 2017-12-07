import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { Input, Select } from 'antd';
import { injectIntl, intlShape } from 'react-intl';

import FormFieldWrapper from '../../../../components/Form/FormFieldWrapper.tsx';
import ButtonStyleless from '../../../../components/ButtonStyleless.tsx';
import FormSelect from '../../../../components/Form/FormSelect/FormSelect.tsx';
import messages from '../Edit/messages';

const Option = Select.Option;

class CreativeFormatEditor extends Component {

  state = { standardFormat: true }

  render() {
    const {
      intl: { formatMessage },
      formats,
      input,
      meta,
      disabled,
    } = this.props;
    const { standardFormat } = this.state;

    let validateStatus = 'success';
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
    const dimensions = input.value.split('x');
    const width = dimensions[0];
    const height = dimensions[1];

    const onDimensionChange = (type) => (e) => {
      const { value } = e.target;
      const isDimension = !value || (/^\d+$/i.test(value) && value.length < 15);

      if (isDimension) {
        input.onChange(type === 'width' ? `${value}x${height}` : `${width}x${value}`);
      }
    };

    return (
      <FormFieldWrapper
        help={meta.warning || meta.error}
        helpToolTipProps={{
          title: formatMessage(messages.creativeCreationGeneralFormatFieldHelper),
        }}
        label={formatMessage(messages.creativeCreationGeneralFormatFieldTitle)}
        required
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

CreativeFormatEditor.defaultProps = {
  disabled: false,
};

CreativeFormatEditor.propTypes = {
  formats: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  input: PropTypes.shape({
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
  }).isRequired,
  intl: intlShape.isRequired,
  meta: PropTypes.shape().isRequired,
  disabled: PropTypes.bool,
};

export default compose(
    injectIntl,
  )(CreativeFormatEditor);

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { injectIntl, intlShape } from 'react-intl';

import FormFieldWrapper from '../../../components/Form/FormFieldWrapper.tsx';
import ButtonStyleless from '../../../components/ButtonStyleless.tsx';
import CreativeCustomFormat from './CreativeCustomFormat.tsx';
import CreativeStandardFormat from './CreativeStandardFormat.tsx';
import messages from './Edit/messages';

class CreativeFormatEditor extends Component {

  state = { standardFormat: true }

  render() {
    const { standardFormat } = this.state;
    const {
      intl: { formatMessage },
      formats,
      input,
      meta,
    } = this.props;

    let validateStatus = 'success';
    if (meta.touched && meta.invalid) validateStatus = 'error';
    if (meta && meta.touched && meta.warning) validateStatus = 'warning';

    const fieldWrapperProps = {
      help: meta.touched && (meta.warning || meta.error),
      helpToolTipProps: {
        title: formatMessage(messages.creativeCreationGeneralFormatFieldHelper),
      },
      label: formatMessage(messages.creativeCreationGeneralFormatFieldTitle),
      required: true,
      validateStatus,
    };

    const buttonLabel = formatMessage(messages[standardFormat
      ? 'creativeCreationGeneralFormatFieldButtonCustom'
      : 'creativeCreationGeneralFormatFieldButtonStandard'
    ]);

    const buttonOnClick = (e) => {
      e.preventDefault();
      this.setState({ standardFormat: !standardFormat });
    };

    return (
      <FormFieldWrapper
        {...fieldWrapperProps}
      >
        <div className="creative-format">
          <div className="field">
            {standardFormat
              ? (
                <CreativeStandardFormat
                  // select={{
                  //   defaultValue: formats[0]
                  // }}
                  input={input}
                  options={formats}
                />
              )
              : (
                <CreativeCustomFormat
                  input={input}
                />
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

CreativeFormatEditor.propTypes = {
  formats: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  input: PropTypes.shape({
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
  }).isRequired,
  intl: intlShape.isRequired,
  isLoading: PropTypes.bool.isRequired,
  meta: PropTypes.shape().isRequired,
};

export default compose(
    injectIntl,
  )(CreativeFormatEditor);

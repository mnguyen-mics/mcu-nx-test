import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import messages from '../messages';
import { Form } from '../../../../../../../components/index.ts';

const {
  FormInput,
  FormSection,
} = Form;

class Attribution extends Component {

  state = { advancedSectionDisplayed: false };

  render() {
    const {
      fieldNormalizer: { normalizeInteger },
      fieldValidators: { isRequired, isValidInteger },
      formatMessage,
    } = this.props;

    const fieldGridConfig = {
      labelCol: { span: 3 },
      wrapperCol: { span: 10, offset: 1 },
    };

    return (
      <div id="Attribution">
        <FormSection
          subtitle={messages.sectionSubtitle2}
          title={messages.sectionTitle2}
        />

        <div>
          <Field
            name="attribution[0].post_click"
            component={FormInput}
            normalize={normalizeInteger}
            validate={[isRequired, isValidInteger]}
            props={{
              formItemProps: {
                label: formatMessage(messages.contentSection2Row1Label),
                required: true,
                ...fieldGridConfig,
              },
              inputProps: {
                placeholder: formatMessage(messages.contentSection2Row1Placeholder),
              },
              helpToolTipProps: {
                title: formatMessage(messages.contentSection2Row1Tooltip),
              },
            }}
          />
        </div>

        <div>
          <Field
            name="attribution[0].post_view"
            component={FormInput}
            normalize={normalizeInteger}
            validate={[isRequired, isValidInteger]}
            props={{
              formItemProps: {
                label: formatMessage(messages.contentSection2Row2Label),
                required: true,
                ...fieldGridConfig,
              },
              inputProps: {
                placeholder: formatMessage(messages.contentSection2Row2Placeholder),
              },
              helpToolTipProps: {
                title: formatMessage(messages.contentSection2Row2Tooltip),
              },
            }}
          />
        </div>


      </div>
    );
  }
}

Attribution.propTypes = {
  fieldNormalizer: PropTypes.shape({
    normalizeInteger: PropTypes.func.isRequired,
  }).isRequired,

  fieldValidators: PropTypes.shape({
    isRequired: PropTypes.func.isRequired,
    isValidInteger: PropTypes.func.isRequired,
  }).isRequired,

  formatMessage: PropTypes.func.isRequired,
};

export default Attribution;

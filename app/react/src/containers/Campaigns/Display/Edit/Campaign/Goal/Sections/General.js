import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import messages from '../messages';
import { ButtonStyleless, Form, McsIcons } from '../../../../../../../components/index.ts';

const {
  FormInput,
  FormSection,
} = Form;

class General extends Component {

  state = { advancedSectionDisplayed: false };

  displayAdvancedSection = (e) => {
    e.preventDefault();
    this.setState({ advancedSectionDisplayed: !this.state.advancedSectionDisplayed });
  }

  render() {
    const {
      fieldValidators: { isRequired },
      formatMessage,
    } = this.props;

    const fieldGridConfig = {
      labelCol: { span: 3 },
      wrapperCol: { span: 10, offset: 1 },
    };

    return (
      <div id="general">
        <FormSection
          subtitle={messages.sectionSubtitle1}
          title={messages.sectionTitle1}
        />

        <div>
          <Field
            name="name"
            component={FormInput}
            validate={[isRequired]}
            props={{
              formItemProps: {
                label: formatMessage(messages.contentSectionGeneralRow1Label),
                required: true,
                ...fieldGridConfig,
              },
              inputProps: {
                placeholder: formatMessage(messages.contentSectionGeneralRow1Placeholder),
              },
              helpToolTipProps: {
                title: formatMessage(messages.contentSectionGeneralRow1Tooltip),
              },
            }}
          />
        </div>

        <div>
          <ButtonStyleless
            className="optional-section-title"
            onClick={this.displayAdvancedSection}
          >
            <McsIcons type="settings" />
            <span className="step-title">
              {formatMessage(messages.contentSectionGeneralAdvancedPartTitle)}
            </span>
            <McsIcons type="chevron" />
          </ButtonStyleless>

          <div className={!this.state.advancedSectionDisplayed ? 'hide-section' : 'optional-section-content'}>
            <Field
              name="technical_name"
              component={FormInput}
              props={{
                formItemProps: {
                  label: formatMessage(messages.contentSectionGeneralAdvancedPartRow1Label),
                  ...fieldGridConfig,
                },
                inputProps: {
                  placeholder: formatMessage(messages.contentSectionGeneralAdvancedPartRow1Placeholder),
                },
                helpToolTipProps: {
                  title: formatMessage(messages.contentSectionGeneralAdvancedPartRow1Tooltip),
                },
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

General.propTypes = {

  fieldValidators: PropTypes.shape({
    isRequired: PropTypes.func.isRequired,
  }).isRequired,

  formatMessage: PropTypes.func.isRequired,
};

export default General;

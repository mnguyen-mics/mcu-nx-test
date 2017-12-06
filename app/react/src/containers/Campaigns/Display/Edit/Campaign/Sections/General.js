import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import messages from '../messages';
import { ButtonStyleless, Form, McsIcons } from '../../../../../../components/index.ts';

const {
  FormInput,
  FormSection,
  FormSelect,
} = Form;

const { AddonSelect } = FormSelect;

class General extends Component {

  state = { advancedSectionDisplayed: false };

  displayAdvancedSection = () => {
    this.setState({ advancedSectionDisplayed: !this.state.advancedSectionDisplayed });
  }

  render() {
    const {
      fieldNormalizer: { normalizeFloat, normalizeInteger },
      fieldValidators: { isRequired, isNotZero, isValidFloat, isValidInteger },
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

          <Field
            name="total_impression_capping"
            component={FormInput}
            normalize={normalizeInteger}
            validate={[isValidInteger]}
            props={{
              formItemProps: {
                label: formatMessage(messages.contentSectionGeneralAdvancedPartRow2Label),
              },
              inputProps: {
                placeholder: formatMessage(messages.contentSectionGeneralAdvancedPartRow2Placeholder),
              },
              helpToolTipProps: {
                title: formatMessage(messages.contentSectionGeneralAdvancedPartRow2Tooltip),
              },
            }}
          />

          <Field
            name="per_day_impression_capping"
            component={FormInput}
            normalize={normalizeInteger}
            validate={[isValidInteger]}
            props={{
              formItemProps: {
                label: formatMessage(messages.contentSectionGeneralAdvancedPartRow3Label),
              },
              inputProps: {
                placeholder: formatMessage(messages.contentSectionGeneralAdvancedPartRow3Placeholder),
              },
              helpToolTipProps: {
                title: formatMessage(messages.contentSectionGeneralAdvancedPartRow3Tooltip),
              },
            }}
          />

          <Field
            name="total_budget"
            component={FormInput}
            validate={[isValidFloat, isNotZero]}
            props={{
              formItemProps: {
                label: formatMessage(messages.contentSectionGeneralAdvancedPartRow4Label),
              },
              inputProps: {
                suffix: (<span>€</span>),
                placeholder: formatMessage(messages.contentSectionGeneralAdvancedPartRow4Placeholder),
              },
              helpToolTipProps: {
                title: formatMessage(messages.contentSectionGeneralAdvancedPartRow4Tooltip),
              },
            }}
          />

          <Field
            name="max_budget_per_period"
            component={FormInput}
            validate={[isValidFloat, isNotZero]}
            props={{
              formItemProps: {
                label: formatMessage(messages.contentSectionGeneralAdvancedPartRow5Label),
              },
              inputProps: {
                suffix: (<span>€</span>),
                addonAfter: (
                  <Field
                    name="max_budget_period"
                    component={AddonSelect}
                    props={{
                      options: [
                        { value: 'DAY', title: formatMessage(messages.contentSectionGeneralRow5OptionDAY) },
                        { value: 'WEEK', title: formatMessage(messages.contentSectionGeneralRow5OptionWEEK) },
                        { value: 'MONTH', title: formatMessage(messages.contentSectionGeneralRow5OptionMONTH) },
                      ],
                    }}
                  />
                ),
                placeholder: formatMessage(messages.contentSectionGeneralAdvancedPartRow5Placeholder),
                style: { width: '100%' },
              },
              helpToolTipProps: {
                title: formatMessage(messages.contentSectionGeneralAdvancedPartRow5Tooltip),
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

General.defaultProps = {
  formValues: null,
};

General.propTypes = {
  fieldNormalizer: PropTypes.shape({
    normalizeFloat: PropTypes.func.isRequired,
    normalizeInteger: PropTypes.func.isRequired,
  }).isRequired,

  fieldValidators: PropTypes.shape({
    isRequired: PropTypes.func.isRequired,
  }).isRequired,

  formatMessage: PropTypes.func.isRequired,
};

export default General;

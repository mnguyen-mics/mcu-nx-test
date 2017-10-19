import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row } from 'antd';
import { Field } from 'redux-form';

import messages from '../../messages';
import { ButtonStyleless, McsIcons, Form } from '../../../../../../components/index.ts';

const {
  FormInput,
  FormRangePicker,
  FormSection,
  FormSelectAddon,
} = Form;

class General extends Component {

  state = { advancedSectionDisplayed: false };

  displayAdvancedSection = (e) => {
    e.preventDefault();
    this.setState({ advancedSectionDisplayed: !this.state.advancedSectionDisplayed });
  }

  render() {
    const {
      fieldNormalizer: { normalizeNumber },
      fieldValidators: { isRequired },
      formatMessage,
      formValues,
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

        <Row>
          <Field
            name="adGroupName"
            component={FormInput}
            validate={[isRequired]}
            props={{
              formItemProps: {
                label: formatMessage(messages.contentSection1Row1Label),
                required: true,
                ...fieldGridConfig,
              },
              inputProps: {
                placeholder: formatMessage(messages.contentSection1Row1Placeholder),
              },
              helpToolTipProps: {
                title: formatMessage(messages.contentSection1Row1Tooltip),
              },
            }}
          />
        </Row>

        <Row>
          <Field
            name="adGroupMaxBudgetPerPeriod"
            component={FormInput}
            normalize={normalizeNumber}
            validate={[isRequired]}
            props={{
              formItemProps: {
                label: formatMessage(messages.contentSection1Row2Label),
                required: true,
                ...fieldGridConfig,
              },
              inputProps: {
                addonAfter: (
                  <Field
                    name="adGroupMaxBudgetPeriod"
                    component={FormSelectAddon}
                    props={{
                      options: [
                        { value: 'DAY', title: formatMessage(messages.contentSection1Row2OptionDAY) },
                        { value: 'WEEK', title: formatMessage(messages.contentSection1Row2OptionWEEK) },
                        { value: 'MONTH', title: formatMessage(messages.contentSection1Row2OptionMONTH) },
                      ],
                    }}
                  />
                ),
                placeholder: formatMessage(messages.contentSection1Row2Placeholder),
                style: { width: '100%' }
              },
              helpToolTipProps: {
                title: formatMessage(messages.contentSection1Row2Tooltip),
              },
            }}
          />
        </Row>

        <Row>
          <Field
            name="adGroupTotalBudget"
            component={FormInput}
            normalize={normalizeNumber}
            validate={[isRequired]}
            props={{
              formItemProps: {
                label: formatMessage(messages.contentSection1Row3Label),
                required: true,
                ...fieldGridConfig,
              },
              inputProps: {
                placeholder: formatMessage(messages.contentSection1Row3Placeholder)
              },
              helpToolTipProps: {
                title: formatMessage(messages.contentSection1Row3Tooltip),
              },
            }}
          />
        </Row>

        <Row>
          <FormRangePicker
            formId="adGroupForm"

            formItemProps={{
              label: formatMessage(messages.contentSection1Row4Label),
              labelCol: { span: 3 },
              wrapperCol: { span: 10, offset: 1 },
              required: true,
            }}

            startProps={{
              name: 'adGroupStartDate',
              placeholder: formatMessage(messages.contentSection1Row4Placeholder1),
              style: { width: '100%' },
            }}

            endProps={{
              name: 'adGroupEndDate',
              placeholder: formatMessage(messages.contentSection1Row4Placeholder2),
              style: { width: '100%' },
            }}

            values={{
              startDate: formValues && formValues.adGroupStartDate,
              endDate: formValues && formValues.adGroupEndDate,
            }}

            fieldValidators={{ start: [isRequired], end: [isRequired] }}

            helpToolTipProps={{
              placement: 'right',
              title: formatMessage(messages.contentSection1Row4Tooltip),
            }}
          />
        </Row>

        <div>
          <ButtonStyleless
            className="optional-section-title clickable-on-hover"
            onClick={this.displayAdvancedSection}
          >
            <McsIcons type="settings" />
            <span className="step-title">
              {formatMessage(messages.contentSection1AdvancedPartTitle)}
            </span>
            <McsIcons type="chevron" />
          </ButtonStyleless>

          <Row className={!this.state.advancedSectionDisplayed ? 'hide-section' : ''}>
            <Field
              name="adGroupTechnicalName"
              component={FormInput}
              props={{
                formItemProps: {
                  label: formatMessage(messages.contentSection1Row5Label),
                  ...fieldGridConfig,
                },
                inputProps: {
                  placeholder: formatMessage(messages.contentSection1Row5Placeholder),
                },
                helpToolTipProps: {
                  title: formatMessage(messages.contentSection1Row5Tooltip),
                },
              }}
            />
          </Row>
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
    isNumber: PropTypes.func.isRequired,
  }).isRequired,

  fieldValidators: PropTypes.shape({
    isRequired: PropTypes.func.isRequired,
  }).isRequired,

  formatMessage: PropTypes.func.isRequired,
  formValues: PropTypes.shape(),
};

export default General;

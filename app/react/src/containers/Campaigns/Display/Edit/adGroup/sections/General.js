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
      fieldGridConfig,
      fieldNormalizer: { normalizeNumber },
      fieldValidators: { isRequired, isNotZero },
      formatMessage,
      formValues,
    } = this.props;

    return (
      <div id="general">
        <FormSection
          subtitle={messages.sectionSubtitleGeneral}
          title={messages.sectionTitleGeneral}
        />

        <Row>
          <Field
            name="adGroupName"
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
        </Row>

        <Row>
          <Field
            name="adGroupMaxBudgetPerPeriod"
            component={FormInput}
            normalize={normalizeNumber}
            validate={[isRequired, isNotZero]}
            props={{
              formItemProps: {
                label: formatMessage(messages.contentSectionGeneralRow2Label),
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
                        { value: 'DAY', title: formatMessage(messages.contentSectionGeneralRow2OptionDAY) },
                        { value: 'WEEK', title: formatMessage(messages.contentSectionGeneralRow2OptionWEEK) },
                        { value: 'MONTH', title: formatMessage(messages.contentSectionGeneralRow2OptionMONTH) },
                      ],
                    }}
                  />
                ),
                placeholder: formatMessage(messages.contentSectionGeneralRow2Placeholder),
                style: { width: '100%' },
                suffix: <span>€</span>,
              },
              helpToolTipProps: {
                title: formatMessage(messages.contentSectionGeneralRow2Tooltip),
              },
            }}
          />
        </Row>

        <Row>
          <Field
            name="adGroupTotalBudget"
            component={FormInput}
            normalize={normalizeNumber}
            validate={[isRequired, isNotZero]}
            props={{
              formItemProps: {
                label: formatMessage(messages.contentSectionGeneralRow3Label),
                required: true,
                ...fieldGridConfig,
              },
              inputProps: {
                placeholder: formatMessage(messages.contentSectionGeneralRow3Placeholder),
                suffix: <span>€</span>,
              },
              helpToolTipProps: {
                title: formatMessage(messages.contentSectionGeneralRow3Tooltip),
              },
            }}
          />
        </Row>

        <Row>
          <FormRangePicker
            formId="adGroupForm"

            formItemProps={{
              label: formatMessage(messages.contentSectionGeneralRow4Label),
              labelCol: { span: 3 },
              wrapperCol: { span: 10, offset: 1 },
              required: true,
            }}

            startProps={{
              name: 'adGroupStartDate',
              placeholder: formatMessage(messages.contentSectionGeneralRow4Placeholder1),
              style: { width: '100%' },
            }}

            endProps={{
              name: 'adGroupEndDate',
              placeholder: formatMessage(messages.contentSectionGeneralRow4Placeholder2),
              style: { width: '100%' },
            }}

            values={{
              startDate: formValues && formValues.adGroupStartDate,
              endDate: formValues && formValues.adGroupEndDate,
            }}

            fieldValidators={{ start: [isRequired], end: [isRequired] }}

            helpToolTipProps={{
              placement: 'right',
              title: formatMessage(messages.contentSectionGeneralRow4Tooltip),
            }}
          />
        </Row>

        <Row>
          <Field
            name="adGroupMaxBidPrice"
            component={FormInput}
            normalize={normalizeNumber}
            validate={[isRequired, isNotZero]}
            props={{
              formItemProps: {
                label: formatMessage(messages.contentSectionGeneralRow5Label),
                required: true,
                ...fieldGridConfig,
              },
              inputProps: {
                placeholder: formatMessage(messages.contentSectionGeneralRow5Placeholder),
                suffix: <span>€</span>,
              },
              helpToolTipProps: {
                title: formatMessage(messages.contentSectionGeneralRow5Tooltip),
              },
            }}
          />
        </Row>

        <Row>
          <Field
            name="adGroupTotalImpressionCapping"
            component={FormInput}
            normalize={normalizeNumber}
            validate={[isRequired, isNotZero]}
            props={{
              formItemProps: {
                label: formatMessage(messages.contentSectionGeneralRow6Label),
                required: true,
                ...fieldGridConfig,
              },
              inputProps: {
                placeholder: formatMessage(messages.contentSectionGeneralRow6Placeholder),
                suffix: <span>€</span>,
              },
              helpToolTipProps: {
                title: formatMessage(messages.contentSectionGeneralRow6Tooltip),
              },
            }}
          />
        </Row>

        <Row>
          <Field
            name="adGroupPerDayImpressionCapping"
            component={FormInput}
            normalize={normalizeNumber}
            validate={[isRequired, isNotZero]}
            props={{
              formItemProps: {
                label: formatMessage(messages.contentSectionGeneralRow7Label),
                required: true,
                ...fieldGridConfig,
              },
              inputProps: {
                placeholder: formatMessage(messages.contentSectionGeneralRow7Placeholder),
                suffix: <span>€</span>,
              },
              helpToolTipProps: {
                title: formatMessage(messages.contentSectionGeneralRow7Tooltip),
              },
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
              {formatMessage(messages.contentSectionGeneralAdvancedPartTitle)}
            </span>
            <McsIcons type="chevron" />
          </ButtonStyleless>

          <Row className={!this.state.advancedSectionDisplayed ? 'hide-section' : ''}>
            <Field
              name="adGroupTechnicalName"
              component={FormInput}
              props={{
                formItemProps: {
                  label: formatMessage(messages.contentSectionGeneralRow8Label),
                  ...fieldGridConfig,
                },
                inputProps: {
                  placeholder: formatMessage(messages.contentSectionGeneralRow8Placeholder),
                },
                helpToolTipProps: {
                  title: formatMessage(messages.contentSectionGeneralRow8Tooltip),
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
  fieldGridConfig: PropTypes.shape().isRequired,

  fieldNormalizer: PropTypes.shape({
    isNumber: PropTypes.func.isRequired,
  }).isRequired,

  fieldValidators: PropTypes.shape({
    isNotZero: PropTypes.func.isRequired,
    isRequired: PropTypes.func.isRequired,
  }).isRequired,

  formatMessage: PropTypes.func.isRequired,
  formValues: PropTypes.shape(),
};

export default General;

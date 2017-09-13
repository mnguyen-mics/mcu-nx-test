import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row } from 'antd';
import { Field, getFormValues } from 'redux-form';

import messages from '../../messages';
import { ButtonStyleless, Form, McsIcons } from '../../../../../../components';

const {
  FormInput,
  FormRangePicker,
  FormSection,
  FormSelectAddon,
} = Form;

class General extends Component {

  state = { advancedSectionDisplayed: false };

  displayAdvancedSection = () => {
    this.setState({ advancedSectionDisplayed: !this.state.advancedSectionDisplayed });
  }

  render() {
    const {
      fieldValidators: { isRequired },
      formatMessage,
      values,
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
            name="adGroupBudgetSplit"
            component={FormInput}
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
                    name="adGroupBudgetSplitPeriod"
                    component={FormSelectAddon}
                    props={{
                      options: [
                        formatMessage(messages.contentSection1Row2Option1),
                        formatMessage(messages.contentSection1Row2Option2),
                        formatMessage(messages.contentSection1Row2Option3),
                      ],
                    }}
                  />
              ),
                placeholder: formatMessage(messages.contentSection1Row2Placeholder),
                style: { width: '100%' },
                type: 'number',
              },
              helpToolTipProps: {
                title: formatMessage(messages.contentSection1Row2Tooltip),
              },
            }}
          />
        </Row>

        <Row>
          <Field
            name="adGroupBudgetTotal"
            component={FormInput}
            validate={[isRequired]}
            props={{
              formItemProps: {
                label: formatMessage(messages.contentSection1Row3Label),
                required: true,
                ...fieldGridConfig,
              },
              inputProps: {
                placeholder: formatMessage(messages.contentSection1Row3Placeholder),
                type: 'number',
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
              name: 'adGroupBudgetStartDate',
              placeholder: formatMessage(messages.contentSection1Row4Placeholder1),
              style: { width: '100%' },
            }}

            endProps={{
              name: 'adGroupBudgetEndDate',
              placeholder: formatMessage(messages.contentSection1Row4Placeholder2),
              style: { width: '100%' },
            }}

            values={{
              startDate: values && values.adGroupBudgetStartDate,
              endDate: values && values.adGroupBudgetEndDate,
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
            className="optional-section-title"
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
  values: null,
};

General.propTypes = {
  fieldValidators: PropTypes.shape({
    isRequired: PropTypes.func.isRequired,
  }).isRequired,

  formatMessage: PropTypes.func.isRequired,
  values: PropTypes.shape(),
};

const ConnectedGeneral = connect(
  state => ({
    values: getFormValues('adGroupForm')(state),
  }),
)(General);

export default ConnectedGeneral;

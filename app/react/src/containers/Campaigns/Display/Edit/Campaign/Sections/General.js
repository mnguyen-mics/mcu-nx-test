import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row } from 'antd';
import { Field } from 'redux-form';

import messages from '../messages';
import { ButtonStyleless, Form, McsIcons } from '../../../../../../components/index.ts';

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

        <Row>
          <Field
            name="name"
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
              name="technical_name"
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

  fieldValidators: PropTypes.shape({
    isRequired: PropTypes.func.isRequired,
  }).isRequired,

  formatMessage: PropTypes.func.isRequired,
};

export default General;

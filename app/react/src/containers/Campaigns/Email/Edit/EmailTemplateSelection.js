import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Row } from 'antd';
import { injectIntl, intlShape } from 'react-intl';

import messages from './messages';
import EmailTemplateSelector from './EmailTemplateSelector';
import { FormTitle } from '../../../../components/Form';
import { RecordElement, RelatedRecords } from '../../../../components/RelatedRecord';
import CreativeService from '../../../../services/CreativeService';

class EmailTemplateSelection extends Component {

  constructor(props) {
    super(props);
    this.updateSelectedEmailTemplates = this.updateSelectedEmailTemplates.bind(this);
    this.handleClickOnSelectTemplate = this.handleClickOnSelectTemplate.bind(this);
    this.loadEmailTemplateIfNeeded = this.loadEmailTemplateIfNeeded.bind(this);
    this.state = {
      emailTemplates: []
    };
  }

  componentWillReceiveProps(nextProps) {
    const { input: { value } } = nextProps;
    (value || []).forEach(emailTemplateSelection => this.loadEmailTemplateIfNeeded(emailTemplateSelection.email_template_id));
  }

  loadEmailTemplateIfNeeded(templateId) {
    const { emailTemplates } = this.state;
    const found = emailTemplates.find(t => t.id === templateId);
    if (!found) {
      CreativeService.getEmailTemplate(templateId).then(emailTemplate => {
        this.setState(prevState => ({
          emailTemplates: [
            ...prevState.emailTemplates,
            emailTemplate
          ]
        }));
      });
    }
  }

  updateSelectedEmailTemplates(emailTemplateSelections) {
    const { closeNextDrawer, input } = this.props;
    const newSelections = input.value || [{}];
    newSelections[0].email_template_id = emailTemplateSelections[0].email_template_id;
    input.onChange(newSelections);
    this.loadEmailTemplateIfNeeded(newSelections[0].email_template_id);
    closeNextDrawer();
  }

  handleClickOnSelectTemplate() {
    const { openNextDrawer, closeNextDrawer, input } = this.props;

    const emailTemplateSelectorProps = {
      save: this.updateSelectedEmailTemplates,
      close: closeNextDrawer,
      emailTemplateSelections: input.value || []
    };

    const options = {
      additionalProps: emailTemplateSelectorProps,
      isModal: true
    };

    openNextDrawer(EmailTemplateSelector, options);
  }

  getEmailTemplateRecords() {
    const { input: { value } } = this.props;

    return (value || []).map(emailTemplateSelection => {
      const emailTemplate = this.state.emailTemplates.find(t => t.id === emailTemplateSelection.email_template_id) || {};
      return (
        <RecordElement
          key={emailTemplateSelection.email_template_id}
          recordIconType={'email'}
          title={emailTemplate.name}
        />
      );
    });
  }

  render() {

    const {
      meta,
      intl: { formatMessage },
    } = this.props;

    const showError = meta.touched && meta.error;

    const emptyOption = {
      message: showError ? formatMessage(messages.blastTemplateSelectionRequired) : formatMessage(messages.blastTemplateSelectionEmpty),
      className: showError ? 'required' : ''
    };

    return (
      <div>
        <Row type="flex" align="middle" justify="space-between" className="section-header">
          <FormTitle
            titleMessage={messages.emailBlastEditorStepTitleTemplateSelection}
            subTitleMessage={messages.emailBlastEditorStepSubTitleTemplateSelection}
          />
          <Button onClick={this.handleClickOnSelectTemplate}>
            {formatMessage(messages.blastTemplateSelectionSelectButton)}
          </Button>
        </Row>
        <Row>
          <RelatedRecords emptyOption={emptyOption}>
            {this.getEmailTemplateRecords()}
          </RelatedRecords>
        </Row>
      </div>
    );
  }
}

EmailTemplateSelection.propTypes = {
  input: PropTypes.object.isRequired, // eslint-disable-line
  meta: PropTypes.object.isRequired, // eslint-disable-line
  openNextDrawer: PropTypes.func.isRequired,
  closeNextDrawer: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(EmailTemplateSelection);

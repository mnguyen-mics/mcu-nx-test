import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Row } from 'antd';
import { injectIntl, intlShape } from 'react-intl';

import messages from './messages';
import EmailTemplateSelector from './EmailTemplateSelector';
import { FormTitle } from '../../../../components/Form';
import { RecordElement, RelatedRecords } from '../../../../components/RelatedRecord';

class EmailTemplateSelection extends Component {

  constructor(props) {
    super(props);
    this.updateSelectedEmailTemplateIds = this.updateSelectedEmailTemplateIds.bind(this);
    this.handleClickOnSelectTemplate = this.handleClickOnSelectTemplate.bind(this);
  }

  updateSelectedEmailTemplateIds(emailTemplateIds) {
    const { closeNextDrawer, input } = this.props;
    input.onChange(emailTemplateIds);
    closeNextDrawer();
  }

  handleClickOnSelectTemplate() {
    const { openNextDrawer, closeNextDrawer, input } = this.props;

    const emailTemplateSelectorProps = {
      save: this.updateSelectedEmailTemplateIds,
      close: closeNextDrawer,
      selectedTemplates: input.value || []
    };

    const options = {
      additionalProps: emailTemplateSelectorProps,
      isModal: true
    };

    openNextDrawer(EmailTemplateSelector, options);
  }

  getEmailTemplateRecords() {
    const { input: { value } } = this.props;

    return (value || []).map(emailTemplate => {
      return (
        <RecordElement
          key={emailTemplate.id}
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
      message: showError ? formatMessage(messages.emailTemplateSelectionRequired) : formatMessage(messages.emailTemplateSelectionEmpty),
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
            {formatMessage(messages.emailTemplateSelectionSelectButton)}
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

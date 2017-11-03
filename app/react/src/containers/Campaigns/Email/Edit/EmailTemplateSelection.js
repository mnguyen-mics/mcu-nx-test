import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { Row } from 'antd';
import { injectIntl, intlShape } from 'react-intl';

import messages from './messages';
import CreativeCardSelector from './CreativeCardSelector';
import { RecordElement, RelatedRecords } from '../../../../components/RelatedRecord/index.ts';
import { FormSection } from '../../../../components/Form/index.ts';
import CreativeService from '../../../../services/CreativeService';
import { withMcsRouter } from '../../../Helpers';

class EmailTemplateSelection extends Component {

  constructor(props) {
    super(props);

    this.state = {
      emailTemplates: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    const { input: { value } } = nextProps;

    (value || []).forEach(emailTemplateSelection => {
      this.loadEmailTemplateIfNeeded(emailTemplateSelection.email_template_id);
    });
  }

  getEmailTemplateRecords() {
    return (this.state.emailTemplates || []).map(template => {
      return (
        <RecordElement
          key={template.id}
          recordIconType={'email'}
          title={template.name}
        />
      );
    });
  }

  getEmailTemplates = (options) => {
    const { organisationId } = this.props;

    return CreativeService.getEmailTemplates(organisationId, options)
      .then(response => ({
        data: response.data,
        total: response.total,
      }));
  }

  handleClickOnSelectTemplate = () => {
    const { openNextDrawer, closeNextDrawer, input } = this.props;

    const emailTemplateSelectorProps = {
      save: this.updateSelectedEmailTemplates,
      close: closeNextDrawer,
      selectedData: input.value || [],
    };

    const options = {
      additionalProps: emailTemplateSelectorProps,
      fetchData: this.getEmailTemplates,
      isModal: true,
      singleSelection: true,
    };

    openNextDrawer(CreativeCardSelector, options);
  }

  loadEmailTemplateIfNeeded = (templateId) => {
    if (!templateId) {
      this.setState(() => ({ emailTemplate: [] }));
    } else {

      CreativeService.getEmailTemplate(templateId).then(emailTemplate => {
        const { emailTemplates } = this.state;
        const found = emailTemplates.find(t => t.id === templateId);
        if (!found) {
          this.setState(() => ({
            emailTemplates: [
              emailTemplate,
            ],
          }));
        }
      });
    }
  }

  updateSelectedEmailTemplates = (selections) => {
    const { closeNextDrawer, input } = this.props;

    input.onChange(selections);
    this.loadEmailTemplateIfNeeded(selections[0] ? selections[0].id : null);
    closeNextDrawer();
  }

  render() {
    const {
      meta,
      intl: { formatMessage },
    } = this.props;

    const showError = meta.touched && meta.error;

    const emptyOption = {
      message: (showError
        ? formatMessage(messages.blastTemplateSelectionRequired)
        : formatMessage(messages.blastTemplateSelectionEmpty)
      ),
      className: showError ? 'required' : '',
    };

    return (
      <div>
        <FormSection
          button={{
            message: formatMessage(messages.blastTemplateSelectionSelectButton),
            onClick: this.handleClickOnSelectTemplate,
          }}
          subtitle={messages.emailBlastEditorStepSubTitleTemplateSelection}
          title={messages.emailBlastEditorStepTitleTemplateSelection}
        />
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
  closeNextDrawer: PropTypes.func.isRequired,
  input: PropTypes.shape().isRequired,
  intl: intlShape.isRequired,
  meta: PropTypes.shape().isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  organisationId: PropTypes.string.isRequired,
};

export default compose(
  withMcsRouter,
  injectIntl,
)(EmailTemplateSelection);

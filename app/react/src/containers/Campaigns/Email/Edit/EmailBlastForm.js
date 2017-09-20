import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { Field, Form, reduxForm } from 'redux-form';
import { injectIntl, intlShape } from 'react-intl';
import { Layout, Row } from 'antd';

import { withValidators, FormSection, FormSelect, FormInput, FormDatePicker } from '../../../../components/Form';
import { RecordElement, RelatedRecords } from '../../../../components/RelatedRecord';
import EmailTemplateSelection from './EmailTemplateSelection';
import SegmentSelector from './SegmentSelector';
import messages from './messages';
import ConsentService from '../../../../services/ConsentService';
import { isPastDate } from '../../../../utils/DateHelper';

const { Content } = Layout;

class EmailBlastForm extends Component {

  state = {
    consents: [],
    segments: this.props.segments,
    segmentRequired: false,
    userEmailCount: 0,
  }

  componentDidMount() {
    const {
      match: { params: { organisationId } },
    } = this.props;

    ConsentService.getConsents(organisationId).then((response) => {
      this.setState({
        consents: response.data,
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    const { segments } = this.props;
    const { segments: nextSegments } = nextProps;
    if (nextSegments.length !== segments.length) {
      this.setState({ segments: nextSegments });
    }
  }

  updateSegments = (selectedAudienceSegments) => {
    const { closeNextDrawer } = this.props;

    const buildSegmentSelection = segment => ({
      audience_segment_id: segment.id,
      name: segment.name,
    });

    this.setState(prevState => ({
      segments: selectedAudienceSegments.map(buildSegmentSelection),
      segmentRequired: !prevState.segmentRequired,
    }));
    closeNextDrawer();
  }

  handleClickOnRemoveSegment(segment) {
    this.setState(prevState => ({
      segments: prevState.segments.filter(s => s.audience_segment_id !== segment.audience_segment_id),
    }));
  }

  getSegmentRecords() {
    const { segments } = this.state;

    const segmentRecords = segments.filter(segment => !segment.isDeleted).map(segment => {

      return (
        <RecordElement
          key={segment.audience_segment_id}
          recordIconType={'users'}
          title={segment.name}
          actionButtons={[
            { iconType: 'delete', onClick: () => this.handleClickOnRemoveSegment(segment) },
          ]}
        />
      );
    });

    return segmentRecords;
  }

  handleSegmentActionClick = () => {
    const {
      openNextDrawer,
      closeNextDrawer,
    } = this.props;

    const { segments } = this.state;

    const segmentSelectorProps = {
      save: this.updateSegments,
      close: closeNextDrawer,
      selectedIds: segments.map(s => s.audience_segment_id),
    };

    const options = {
      additionalProps: segmentSelectorProps,
    };

    openNextDrawer(SegmentSelector, options);
  }

  handleSave = (formValues) => {
    const { save } = this.props;
    const { segments } = this.state;
    if (segments.length === 0) {
      this.setState({ segmentRequired: true });
    } else {
      save({
        ...formValues.blast,
        segments,
      });
    }
  }

  render() {
    const {
      intl: { formatMessage },
      fieldValidators: { isRequired, isValidEmail },
      formId,
      handleSubmit,
      closeNextDrawer,
      openNextDrawer,
    } = this.props;

    const { consents, segmentRequired } = this.state;

    const fieldGridConfig = {
      labelCol: { span: 3 },
      wrapperCol: { span: 10, offset: 1 },
    };


    const emptySegmentOption = {
      message: (segmentRequired
        ? formatMessage(messages.blastSegmentSelectionRequired)
        : formatMessage(messages.blastSegmentSelectionEmpty)
      ),
      className: segmentRequired ? 'required' : '',
    };

    return (
      <Form
        className="edit-layout ant-layout"
        id={formId}
        onSubmit={handleSubmit(this.handleSave)}
      >
        <Content className="mcs-content-container mcs-form-container">
          <div id="general">
            <FormSection
              subtitle={messages.emailBlastEditorStepSubTitleGeneralInformation}
              title={messages.emailBlastEditorStepTitleGeneralInformation}
            />

            <Row>
              <Field
                name="blast.blast_name"
                component={FormInput}
                validate={[isRequired]}
                props={{
                  formItemProps: {
                    label: formatMessage(messages.emailBlastEditorInputLabelBlastName),
                    required: true,
                    ...fieldGridConfig,
                  },
                  inputProps: {
                    placeholder: formatMessage(messages.emailBlastEditorInputPlaceholderBlastName),
                  },
                  helpToolTipProps: {
                    title: formatMessage(messages.emailBlastEditorInputHelperBlastName),
                  },
                }}
              />
              <Field
                name="blast.send_date"
                component={FormDatePicker}
                validate={[isRequired]}
                props={{
                  formItemProps: {
                    label: formatMessage(messages.emailBlastEditorDatePickerLabelSentDate),
                    required: true,
                    ...fieldGridConfig,
                  },
                  datePickerProps: {
                    format: 'DD/MM/YYYY HH:mm',
                    showTime: { format: 'HH:mm' },
                    placeholder: formatMessage(messages.emailBlastEditorDatePickerPlaceholderSentDate),
                    disabledDate: isPastDate,
                  },
                  helpToolTipProps: {
                    title: formatMessage(messages.emailBlastEditorDatePickerHelperSentDate),
                  },
                }}
              />
              <Field
                name="blast.consents[0].consent_id"
                component={FormSelect}
                validate={[isRequired]}
                props={{
                  formItemProps: {
                    label: formatMessage(messages.emailEditorProviderSelectLabel),
                    required: true,
                    ...fieldGridConfig,
                  },
                  options: consents.map(consent => ({
                    key: consent.id,
                    value: consent.id,
                    text: `${consent.name} (${consent.purpose})`,
                  })),
                  helpToolTipProps: {
                    title: formatMessage(messages.emailEditorProviderSelectHelper),
                  },
                }}
              />
            </Row>
          </div>
          <hr />
          <div id="blast">
            <FormSection
              subtitle={messages.emailBlastEditorStepSubTitleBlastInformation}
              title={messages.emailBlastEditorStepTitleBlastInformation}
            />

            <Row>
              <Field
                name="blast.subject_line"
                component={FormInput}
                validate={[isRequired]}
                props={{
                  formItemProps: {
                    label: formatMessage(messages.emailBlastEditorInputLabelSubjectLine),
                    required: true,
                    ...fieldGridConfig,
                  },
                  inputProps: {
                    placeholder: formatMessage(messages.emailBlastEditorInputPlaceholderSubjectLine),
                  },
                  helpToolTipProps: {
                    title: formatMessage(messages.emailBlastEditorInputHelperSubjectLine),
                  },
                }}
              />
              <Field
                name="blast.from_email"
                component={FormInput}
                validate={[isRequired, isValidEmail]}
                props={{
                  formItemProps: {
                    label: formatMessage(messages.emailBlastEditorInputLabelFromEmail),
                    required: true,
                    ...fieldGridConfig,
                  },
                  inputProps: {
                    placeholder: formatMessage(messages.emailBlastEditorInputPlaceholderFromEmail),
                  },
                  helpToolTipProps: {
                    title: formatMessage(messages.emailBlastEditorInputHelperFromEmail),
                  },
                }}
              />
              <Field
                name="blast.from_name"
                component={FormInput}
                validate={[isRequired]}
                props={{
                  formItemProps: {
                    label: formatMessage(messages.emailBlastEditorInputLabelFromName),
                    required: true,
                    ...fieldGridConfig,
                  },
                  inputProps: {
                    placeholder: formatMessage(messages.emailBlastEditorInputPlaceholderFromName),
                  },
                  helpToolTipProps: {
                    title: formatMessage(messages.emailBlastEditorInputHelperFromName),
                  },
                }}
              />
              <Field
                name="blast.reply_to"
                component={FormInput}
                validate={[isRequired, isValidEmail]}
                props={{
                  formItemProps: {
                    label: formatMessage(messages.emailBlastEditorInputLabelReplyTo),
                    required: true,
                    ...fieldGridConfig,
                  },
                  inputProps: {
                    placeholder: formatMessage(messages.emailBlastEditorInputPlaceholderReplyTo),
                  },
                  helpToolTipProps: {
                    title: formatMessage(messages.emailBlastEditorInputHelperReplyTo),
                  },
                }}
              />
            </Row>
          </div>
          <hr />
          <div id="template">
            <Field
              name="blast.templates"
              component={EmailTemplateSelection}
              validate={[isRequired]}
              openNextDrawer={openNextDrawer}
              closeNextDrawer={closeNextDrawer}
            />
          </div>
          <hr />
          <div id="segments">
            <FormSection
              dropdownItems={[
                {
                  id: '2',
                  message: messages.segmentSelectionChooseExisting,
                  onClick: this.handleSegmentActionClick,
                },
              ]}
              subtitle={messages.segmentSelectionSubTitle}
              title={messages.segmentSelectionTitle}
            />
            <Row>
              <RelatedRecords emptyOption={emptySegmentOption}>
                {this.getSegmentRecords()}
              </RelatedRecords>
            </Row>
          </div>
        </Content>
      </Form>
    );
  }
}

EmailBlastForm.defaultProps = {
  isCreationMode: true,
  blastName: '',
  segments: [],
};

EmailBlastForm.propTypes = {
  /* blastName: PropTypes.string --> not currently used */
  closeNextDrawer: PropTypes.func.isRequired,
  /* initialValues={initialValues} --> for redux-form */
  handleSubmit: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  fieldValidators: PropTypes.shape().isRequired,
  formId: PropTypes.string.isRequired,
  match: PropTypes.shape().isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  segments: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    audience_segment_id: PropTypes.string.isRequired,
  })),
};

EmailBlastForm = compose(
  injectIntl,
  withRouter,
  reduxForm({
    form: 'emailBlastForm',
    enableReinitialize: true,
  }),
  withValidators,
)(EmailBlastForm);

export default EmailBlastForm;

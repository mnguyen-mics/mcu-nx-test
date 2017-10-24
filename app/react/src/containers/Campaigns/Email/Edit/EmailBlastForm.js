import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Field, Form, reduxForm, formValueSelector } from 'redux-form';
import { injectIntl, intlShape } from 'react-intl';
import { Layout, Row } from 'antd';

import { withValidators, FormSection, FormSelect, FormInput, FormDatePicker } from '../../../../components/Form/index.ts';
import { RecordElement, RelatedRecords } from '../../../../components/RelatedRecord/index.ts';
import EmailTemplateSelection from './EmailTemplateSelection';
import SegmentReach from './SegmentReach';
import SegmentSelector from './SegmentSelector';
import messages from './messages';
import ConsentService from '../../../../services/ConsentService';
import { isPastDate } from '../../../../utils/DateHelper';
import AudienceSegmentService from '../../../../services/AudienceSegmentService';
import { getDefaultDatamart } from '../../../../state/Session/selectors';

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

  getSegments = () => {
    const {
      defaultDatamart,
      match: { params: { organisationId } },
    } = this.props;

    const datamartId = defaultDatamart(organisationId).id;

    return AudienceSegmentService.getSegmentsWithMetadata(organisationId, datamartId);
  }

  updateSegments = (selectedAudienceSegments) => {
    const { closeNextDrawer } = this.props;

    this.getSegments()
      .then(({ data }) => {
        const buildSegmentSelection = segment => {
          const metadata = data.find(seg => seg.id === segment);

          return {
            audience_segment_id: metadata.id,
            name: metadata.name,
          };
        };

        this.setState(prevState => ({
          segments: selectedAudienceSegments.map(buildSegmentSelection),
          segmentRequired: !prevState.segmentRequired,
        }));
        closeNextDrawer();
      });
  }

  handleClickOnRemoveSegment(segment) {
    this.setState(prevState => ({
      segments: prevState.segments.filter(s => s.audience_segment_id !== segment.audience_segment_id),
    }));
  }

  getSegmentRecords() {
    const { segments } = this.state;

    return segments.filter(segment => !segment.isDeleted).map(segment => (
      <RecordElement
        key={segment.audience_segment_id}
        recordIconType={'users'}
        title={segment.name}
        actionButtons={[
            { iconType: 'delete', onClick: () => this.handleClickOnRemoveSegment(segment) },
        ]}
      />
    ));
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
      formId: scrollLabelContentId,
      handleSubmit,
      closeNextDrawer,
      openNextDrawer,
      selectedConsentId
    } = this.props;

    const { consents, segmentRequired, segments } = this.state;

    const emptySegmentOption = {
      message: (segmentRequired
        ? formatMessage(messages.blastSegmentSelectionRequired)
        : formatMessage(messages.blastSegmentSelectionEmpty)
      ),
      className: segmentRequired ? 'required' : '',
    };

    const segmentIds = segments.map(s => s.audience_segment_id);
    const providerTechnicalNames = selectedConsentId ? consents.filter(c => c.id === selectedConsentId).map(c => c.technical_name) : [];

    return (
      <Form
        className="edit-layout ant-layout"
        onSubmit={handleSubmit(this.handleSave)}
      >
        <Content
          className="mcs-content-container mcs-form-container"
          id={scrollLabelContentId}
        >
          <div id="general">
            <FormSection
              subtitle={messages.emailBlastEditorStepSubTitleGeneralInformation}
              title={messages.emailBlastEditorStepTitleGeneralInformation}
            />

            <Field
              name="blast.blast_name"
              component={FormInput}
              validate={[isRequired]}
              props={{
                formItemProps: {
                  label: formatMessage(messages.emailBlastEditorInputLabelBlastName),
                  required: true,
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
                },
                options: consents.map(consent => ({
                  value: consent.id,
                  title: consent.technical_name,
                })),
                helpToolTipProps: {
                  title: formatMessage(messages.emailEditorProviderSelectHelper),
                },
              }}
            />
          </div>
          <hr />
          <div id="blast">
            <FormSection
              subtitle={messages.emailBlastEditorStepSubTitleBlastInformation}
              title={messages.emailBlastEditorStepTitleBlastInformation}
            />

            <Field
              name="blast.subject_line"
              component={FormInput}
              validate={[isRequired]}
              props={{
                formItemProps: {
                  label: formatMessage(messages.emailBlastEditorInputLabelSubjectLine),
                  required: true,
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
                },
                inputProps: {
                  placeholder: formatMessage(messages.emailBlastEditorInputPlaceholderReplyTo),
                },
                helpToolTipProps: {
                  title: formatMessage(messages.emailBlastEditorInputHelperReplyTo),
                },
              }}
            />
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
            <RelatedRecords emptyOption={emptySegmentOption}>
              {this.getSegmentRecords()}
            </RelatedRecords>
            <div className="section-footer">
              <SegmentReach segmentIds={segmentIds} providerTechnicalNames={providerTechnicalNames} />
            </div>
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
  selectedConsentId: null,
};

EmailBlastForm.propTypes = {
  /* blastName: PropTypes.string --> not currently used */
  closeNextDrawer: PropTypes.func.isRequired,
  defaultDatamart: PropTypes.func.isRequired,
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
  selectedConsentId: PropTypes.string,
};

EmailBlastForm = compose(
  injectIntl,
  withRouter,
  reduxForm({
    form: 'emailBlastForm',
    enableReinitialize: true,
  }),
  withValidators,
  connect(
    (state, ownProps) => ({
      defaultDatamart: getDefaultDatamart(state),
      selectedConsentId: formValueSelector(ownProps.formId)(state, 'blast.consents[0].consent_id')
    }),
  ),
)(EmailBlastForm);

export default EmailBlastForm;

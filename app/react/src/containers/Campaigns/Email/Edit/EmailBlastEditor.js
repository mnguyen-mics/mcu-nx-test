import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import Scrollspy from 'react-scrollspy';
import { Layout, Button, Form, Row, Dropdown, Menu } from 'antd';
import moment from 'moment';

import { Actionbar } from '../../../Actionbar';
import McsIcons from '../../../../components/McsIcons.tsx';
import { withValidators, FormTitle, FormSelect, FormInput, FormDatePicker } from '../../../../components/Form/index.ts';
import { RecordElement, RelatedRecords } from '../../../../components/RelatedRecord/index.ts';
import EmailTemplateSelection from './EmailTemplateSelection';
import SegmentReach from './SegmentReach';
import SegmentSelector from './SegmentSelector';
import messages from './messages';
import ConsentService from '../../../../services/ConsentService';
import AudienceSegmentService from '../../../../services/AudienceSegmentService';

const { Content, Sider } = Layout;

class EmailBlastEditor extends Component {
  constructor(props) {
    super(props);

    this.handleClickOnClose = this.handleClickOnClose.bind(this);

    this.state = {
      consents: [],
      segments: this.props.segments,
      userEmailCount: 0,
    };
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

  handleClickOnClose() {
    this.props.close();
  }

  handleClickOnRemoveSegment(segment) {
    this.setState(prevState => ({
      segments: prevState.segments.filter(s => s.audience_segment_id !== segment.audience_segment_id),
    }));
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
      selectedSegmentIds: segments.map(s => s.audience_segment_id),
    };

    const options = {
      additionalProps: segmentSelectorProps,
    };

    openNextDrawer(SegmentSelector, options);
  }

  handleSave = (formValues) => {
    const { save } = this.props;
    const { segments } = this.state;
    save({
      ...formValues.blast,
      segments,
    });
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

  updateSegments = (selectedAudienceSegmentIds) => {
    const { closeNextDrawer } = this.props;

    const buildSegmentSelection = segment => ({
      audience_segment_id: segment.id,
      name: segment.name,
    });

    Promise.all(selectedAudienceSegmentIds.map(segmentId => {
      return AudienceSegmentService.getSegment(segmentId).then(segment => {
        return buildSegmentSelection(segment);
      });
    })).then(segmentSelections => {
      this.setState({
        segments: segmentSelections
      });
    });

    closeNextDrawer();
  }

  render() {
    const {
      match: { url },
      intl: { formatMessage },
      breadcrumbPaths,
      fieldValidators: { isRequired, isValidEmail },
      handleSubmit,
      close,
      closeNextDrawer,
      openNextDrawer,
      selectedConsentId
    } = this.props;

    const { consents, segments } = this.state;

    const fieldGridConfig = {
      labelCol: { span: 3 },
      wrapperCol: { span: 10, offset: 1 },
    };

    const isPastDate = current => {
      const now = moment();
      return current && current.isBefore(now);
    };

    const emptySegmentOption = {
      message: formatMessage(messages.blastSegmentSelectionEmpty)
    };

    const segmentIds = segments.map(s => s.audience_segment_id);
    const providerTechnicalNames = selectedConsentId ? consents.filter(c => c.id === selectedConsentId).map(c => c.technical_name) : [];

    return (
      <Layout>
        <Form className="edit-layout ant-layout" onSubmit={handleSubmit(this.handleSave)}>
          <Actionbar path={breadcrumbPaths} edition>
            <Button type="primary mcs-primary" htmlType="submit">
              <McsIcons type="plus" /><span>Save</span>
            </Button>
            <McsIcons
              type="close"
              className="close-icon"
              style={{ cursor: 'pointer' }}
              onClick={close}
            />
          </Actionbar>
          <Layout>
            <Sider className="stepper">
              <Scrollspy
                rootEl="#blastSteps"
                items={['general', 'blast', 'template']}
                currentClassName="currentStep"
              >
                <li>
                  <Link to={`${url}#general`}>
                    <McsIcons type="check-rounded-inverted" />
                    <span className="step-title">
                      <FormattedMessage {...messages.emailBlastEditorStepperGeneralInformation} />
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to={`${url}#blast`}>
                    <McsIcons type="check-rounded-inverted" />
                    <span className="step-title">
                      <FormattedMessage {...messages.emailBlastEditorStepperBlastInformation} />
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to={`${url}#template`}>
                    <McsIcons type="check-rounded-inverted" />
                    <span className="step-title">
                      <FormattedMessage {...messages.emailBlastEditorStepperTemplateSelection} />
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to={`${url}#segments`}>
                    <McsIcons type="check-rounded-inverted" />
                    <span className="step-title">
                      <FormattedMessage {...messages.emailBlastEditorStepperSegmentSelection} />
                    </span>
                  </Link>
                </li>
              </Scrollspy>
            </Sider>
            <Layout>
              <Content id={'blastSteps'} className="mcs-content-container mcs-form-container">
                <div id={'general'}>
                  <Row type="flex" align="middle" justify="space-between" className="section-header">
                    <FormTitle
                      titleMessage={messages.emailBlastEditorStepTitleGeneralInformation}
                      subTitleMessage={messages.emailBlastEditorStepSubTitleGeneralInformation}
                    />
                  </Row>
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
                          text: `${consent.technical_name}`,
                        })),
                        helpToolTipProps: {
                          title: formatMessage(messages.emailEditorProviderSelectHelper),
                        },
                      }}
                    />
                  </Row>
                </div>
                <hr />
                <div id={'blast'}>
                  <Row type="flex" align="middle" justify="space-between" className="section-header">
                    <FormTitle
                      titleMessage={messages.emailBlastEditorStepTitleBlastInformation}
                      subTitleMessage={messages.emailBlastEditorStepSubTitleBlastInformation}
                    />
                  </Row>
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
                <div id={'template'}>
                  <Field
                    name="blast.templates"
                    component={EmailTemplateSelection}
                    validate={[isRequired]}
                    openNextDrawer={openNextDrawer}
                    closeNextDrawer={closeNextDrawer}
                  />
                </div>
                <hr />
                <div id={'segments'}>
                  <Row type="flex" align="middle" justify="space-between" className="section-header">
                    <FormTitle
                      titleMessage={messages.segmentSelectionTitle}
                      subTitleMessage={messages.segmentSelectionSubTitle}
                    />
                    <Dropdown
                      trigger={['click']}
                      overlay={(
                        <Menu onClick={this.handleSegmentActionClick} className="mcs-dropdown-actions">
                          { /* <Menu.Item key="1">New segment</Menu.Item> */}
                          <Menu.Item key="2">
                            <FormattedMessage {...messages.segmentSelectionChooseExisting} />
                          </Menu.Item>
                        </Menu>
                        )}
                    >
                      <Button>
                        <McsIcons type="pen" /><McsIcons type="chevron" />
                      </Button>
                    </Dropdown>
                  </Row>
                  <Row>
                    <RelatedRecords emptyOption={emptySegmentOption}>
                      {this.getSegmentRecords()}
                    </RelatedRecords>
                  </Row>
                  <Row className="section-footer">
                    <SegmentReach segmentIds={segmentIds} providerTechnicalNames={providerTechnicalNames} />
                  </Row>
                </div>
              </Content>
            </Layout>
          </Layout>
        </Form>
      </Layout>
    );
  }
}

EmailBlastEditor.defaultProps = {
  isCreationMode: true,
  blastName: '',
  segments: [],
  breadcrumbPaths: [],
  selectedConsentId: null
};

EmailBlastEditor.propTypes = {
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
  }).isRequired,
  intl: intlShape.isRequired,
  fieldValidators: PropTypes.shape().isRequired,
  breadcrumbPaths: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    url: PropTypes.string,
  })),
  segments: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    audience_segment_id: PropTypes.string.isRequired,
  })),
  handleSubmit: PropTypes.func.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  closeNextDrawer: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  selectedConsentId: PropTypes.string,
};

EmailBlastEditor = compose(
  injectIntl,
  withRouter,
  reduxForm({
    form: 'emailBlastEditor',
    enableReinitialize: true,
  }),
  withValidators,
  connect(
    state => ({
      selectedConsentId: formValueSelector('emailBlastEditor')(state, 'blast.consents[0].consent_id')
    })
  )
)(EmailBlastEditor);

export default EmailBlastEditor;

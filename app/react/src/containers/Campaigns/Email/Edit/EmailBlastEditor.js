import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { Field, reduxForm } from 'redux-form';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import Scrollspy from 'react-scrollspy';
import { Layout, Button, Form, Row } from 'antd';

import { Actionbar } from '../../../Actionbar';
import { McsIcons } from '../../../../components/McsIcons';
import { withValidators, FormTitle, FormSelect, FormInput, FormDatePicker } from '../../../../components/Form';
// import EmailTemplateSelection from './EmailTemplateSelection';
import messages from './messages';
import ConsentService from '../../../../services/ConsentService';

const { Content, Sider } = Layout;

class EmailBlastEditor extends Component {
  constructor(props) {
    super(props);

    this.handleClickOnClose = this.handleClickOnClose.bind(this);

    this.state = {
      consents: []
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId }
      }
    } = this.props;

    ConsentService.getConsents(organisationId).then((response) => {
      this.setState({
        consents: response.data
      });
    });
  }

  handleClickOnClose() {
    this.props.close();
  }

  render() {
    const {
      match: { url },
      intl: { formatMessage },
      isCreationMode,
      fieldValidators: { isRequired },
      handleSubmit,
      save,
      close,
      // closeNextDrawer,
      // openNextDrawer
    } = this.props;

    const { consents } = this.state;

    const fieldGridConfig = {
      labelCol: { span: 3 },
      wrapperCol: { span: 10, offset: 1 }
    };

    const breadcrumbPaths = [
      {
        name: formatMessage(isCreationMode ? messages.emailBlastEditorBreadcrumbTitleEditBlast : messages.emailBlastEditorBreadcrumbTitleNewBlast)
      }
    ];

    return (
      <Layout>
        <Form className="edit-layout ant-layout" onSubmit={handleSubmit(save)}>
          <Actionbar path={breadcrumbPaths}>
            <Button type="primary" htmlType="submit">
              <McsIcons type="plus" /><span>Save</span>
            </Button>
            <McsIcons type="close" className="close-icon" style={{ cursor: 'pointer' }} onClick={close} />
          </Actionbar>
          <Layout>
            <Sider className="stepper">
              <Scrollspy rootEl="#blastSteps" items={['general', 'blast', 'template']} currentClassName="currentStep">
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
              </Scrollspy>
            </Sider>
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
                        ...fieldGridConfig
                      },
                      inputProps: {
                        placeholder: formatMessage(messages.emailBlastEditorInputPlaceholderBlastName)
                      },
                      helpToolTipProps: {
                        title: 'Campaign name'
                      }
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
                        ...fieldGridConfig
                      },
                      datePickerProps: {
                        format: 'DD/MM/YYYY HH:mm',
                        showTime: { format: 'HH:mm' },
                        placeholder: formatMessage(messages.emailBlastEditorDatePickerPlaceholderSentDate)
                      },
                      helpToolTipProps: {
                        title: 'Campaign technical name'
                      }
                    }}
                  />
                  <Field
                    name="blast.emailConsents[0].provider_id"
                    component={FormSelect}
                    validate={[isRequired]}
                    props={{
                      formItemProps: {
                        label: formatMessage(messages.emailEditorProviderSelectLabel),
                        required: true,
                        ...fieldGridConfig
                      },
                      options: consents.map(consent => ({
                        key: consent.id,
                        value: consent.id,
                        text: `${consent.name} (${consent.purpose})`
                      })),
                      helpToolTipProps: {
                        title: 'Choose your provider'
                      }
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
                        ...fieldGridConfig
                      },
                      inputProps: {
                        placeholder: formatMessage(messages.emailBlastEditorInputPlaceholderSubjectLine)
                      },
                      helpToolTipProps: {
                        title: 'Campaign name'
                      }
                    }}
                  />
                  <Field
                    name="blast.from_email"
                    component={FormInput}
                    validate={[isRequired]}
                    props={{
                      formItemProps: {
                        label: formatMessage(messages.emailBlastEditorInputLabelFromEmail),
                        required: true,
                        ...fieldGridConfig
                      },
                      inputProps: {
                        placeholder: formatMessage(messages.emailBlastEditorInputPlaceholderFromEmail)
                      },
                      helpToolTipProps: {
                        title: 'Campaign technical name'
                      }
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
                        ...fieldGridConfig
                      },
                      inputProps: {
                        placeholder: formatMessage(messages.emailBlastEditorInputPlaceholderFromName)
                      },
                      helpToolTipProps: {
                        title: 'Campaign technical name'
                      }
                    }}
                  />
                  <Field
                    name="blast.reply_to"
                    component={FormInput}
                    validate={[isRequired]}
                    props={{
                      formItemProps: {
                        label: formatMessage(messages.emailBlastEditorInputLabelReplyTo),
                        required: true,
                        ...fieldGridConfig
                      },
                      inputProps: {
                        placeholder: formatMessage(messages.emailBlastEditorInputPlaceholderReplyTo)
                      },
                      helpToolTipProps: {
                        title: 'Campaign technical name'
                      }
                    }}
                  />
                </Row>
              </div>
              {/* <hr />
              <div id={'template'}>
                <Field
                  name="blastEmailTemplates"
                  component={EmailTemplateSelection}
                  validate={[isRequired]}
                  openNextDrawer={openNextDrawer}
                  closeNextDrawer={closeNextDrawer}
                />
              </div>*/}
            </Content>
          </Layout>
        </Form>
      </Layout>
    );
  }
}

EmailBlastEditor.defaultProps = {
  isCreationMode: true
};

EmailBlastEditor.propTypes = {
  match: PropTypes.shape({
    url: PropTypes.string.isRequired
  }).isRequired,
  intl: intlShape.isRequired,
  fieldValidators: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  handleSubmit: PropTypes.func.isRequired,
  isCreationMode: PropTypes.bool,
  // openNextDrawer: PropTypes.func.isRequired,
  // closeNextDrawer: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired
};

EmailBlastEditor = compose(
  reduxForm({
    form: 'emailBlastEditor'
  }),
  withValidators,
  injectIntl,
  withRouter
)(EmailBlastEditor);

export default EmailBlastEditor;

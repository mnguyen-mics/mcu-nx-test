/* eslint-disajble */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import Scrollspy from 'react-scrollspy';
import { Field, reduxForm } from 'redux-form';
import { compose } from 'recompose';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Layout, Form, Icon, Row, Col, Button, Dropdown, Menu, Modal } from 'antd';

import { Actionbar } from '../../../Actionbar';
import { McsIcons } from '../../../../components/McsIcons';
import { FormInput, FormTitle, FormSelect } from '../../../../components/Form';
import { RecordElement, RelatedRecords } from '../../../../components/RelatedRecord';
import messages from './messages';
import EmailBlastEditor from './EmailBlastEditor';
import * as actions from './actions';
import { getEmailEditorComputedBlastList, getEmailEditorFormInitialValues } from './selectors';
import EmailRouterService from '../../../../services/EmailRouterService';

const { Content, Sider } = Layout;

const required = value => (value ? undefined : 'Required');

class EmailEditor extends Component {
  constructor(props) {
    super(props);
    this.handleClickOnNewBlast = this.handleClickOnNewBlast.bind(this);
    this.handleClickOnEditBlast = this.handleClickOnEditBlast.bind(this);
    this.handleClickOnRemoveBlast = this.handleClickOnRemoveBlast.bind(this);
    this.handleSaveBlast = this.handleSaveBlast.bind(this);
    this.handleEditBlast = this.handleEditBlast.bind(this);
    this.handleSaveEmailCampaign = this.handleSaveEmailCampaign.bind(this);

    this.state = {
      emailRouters: []
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId }
      }
    } = this.props;

    EmailRouterService.getRouters(organisationId).then((response) => {
      this.setState({
        emailRouters: response.data
      });
    });
  }

  handleSaveBlast(blast) {
    const { closeNextDrawer, addBlast } = this.props;
    addBlast(blast);
    closeNextDrawer();
  }

  handleEditBlast(blast) {
    const { closeNextDrawer, editBlast } = this.props;
    editBlast(blast);
    closeNextDrawer();
  }

  handleClickOnEditBlast(blastId) {
    const {
      openNextDrawer,
      closeNextDrawer,
      emailEditorState: {
        blastList: { byId: blastsById },
        emailTemplatesByBlastId
      }
    } = this.props;

    const emailBlastEditorProps = {
      save: this.handleEditBlast,
      close: closeNextDrawer,
      initialValues: blastsById[blastId],
      selectedEmailTemplateIds: emailTemplatesByBlastId[blastId]
    };

    const options = {
      additionalProps: emailBlastEditorProps
    };

    openNextDrawer(EmailBlastEditor, options);
  }

  handleClickOnNewBlast() {
    const { openNextDrawer, closeNextDrawer } = this.props;

    const emailBlastEditorProps = {
      save: this.handleSaveBlast,
      close: closeNextDrawer
    };

    const options = {
      additionalProps: emailBlastEditorProps,
      isModal: true
    };

    openNextDrawer(EmailBlastEditor, options);
  }

  handleClickOnRemoveBlast(blastId) {
    const { removeBlast } = this.props;
    removeBlast(blastId);
  }

  getBlastRecords() {
    const {
      emailEditorState: {
        blastList: {
          allIds: allBlasts,
          byId: blastsById
        }
      }
    } = this.props;

    const blastRecords = allBlasts.map(id => {
      const blast = blastsById[id];

      return (
        <RecordElement
          key={id}
          recordIconType={'email'}
          title={blast.blastName}
          actionButtons={[
            { iconType: 'edit', onClick: () => this.handleClickOnEditBlast(id) },
            { iconType: 'delete', onClick: () => this.handleClickOnRemoveBlast(id) }
          ]}
        >
          <span>
            {blast.sendDate.format('DD/MM/YYYY HH:mm')}
          </span>
        </RecordElement>
      );
    });

    return blastRecords;
  }

  handleSaveEmailCampaign(formValues) {
    const { save, emailEditorState } = this.props;

    const emailEditorData = {
      ...formValues,
      blasts: emailEditorState.blastList
    };

    save(emailEditorData);
  }

  render() {
    const {
      match: {
        url,
        params: { organisationId }
      },
      intl: { formatMessage },
      handleSubmit,
      submitting,
      dirty
    } = this.props;

    const { emailRouters } = this.state;

    const fieldGridConfig = {
      labelCol: { span: 3 },
      wrapperCol: { span: 10, offset: 1 }
    };

    const hasUnsavedChange = dirty; // dirty is for redux-form only, TODO handle wider email campaign modifiction (blasts)

    const breadcrumbPaths = [
      {
        name: formatMessage(messages.emailEditorBreadcrumbTitle1),
        url: `/v2/o/${organisationId}/campaigns/email`
      },
      { name: `${formatMessage(messages.emailEditorBreadcrumbTitle2)}${hasUnsavedChange ? '*' : ''}` }
    ];

    return (
      <Layout>
        <Form className="edit-layout ant-layout" onSubmit={handleSubmit(this.handleSaveEmailCampaign)}>
          <Actionbar path={breadcrumbPaths}>
            <Button type="primary" htmlType="submit" disabled={submitting}>
              <McsIcons type="plus" />
              <FormattedMessage {...messages.emailEditorSaveCampaign} />
            </Button>
            <McsIcons type="close" className="close-icon" style={{ cursor: 'pointer' }} onClick={this.props.close} />
          </Actionbar>
          <Layout>
            <Sider className="stepper">
              <Scrollspy rootEl="#emailCampaignSteps" items={['general', 'router', 'blasts']} currentClassName="currentStep">
                <li>
                  <Link to={`${url}#general`}>
                    <McsIcons type="check-rounded-inverted" />
                    <span className="step-title">General Information</span>
                  </Link>
                </li>
                <li>
                  <Link to={`${url}#router`}>
                    <McsIcons type="check-rounded-inverted" />
                    <span className="step-title">Router Config</span>
                  </Link>
                </li>
                <li>
                  <Link to={`${url}#blasts`}>
                    <McsIcons type="check-rounded-inverted" />
                    <span className="step-title">Email Blasts</span>
                  </Link>
                </li>
              </Scrollspy>
            </Sider>
            <Content id={'emailCampaignSteps'} className="mcs-content-container mcs-form-container">
              <div id={'general'}>
                <Row type="flex" align="middle" justify="space-between" className="section-header">
                  <FormTitle
                    titleMessage={messages.emailEditorGeneralInformationTitle}
                    subTitleMessage={messages.emailEditorGeneralInformationSubTitle}
                  />
                </Row>
                <Row>
                  <Field
                    name="campaign.name"
                    component={FormInput}
                    validate={[required]}
                    props={{
                      formItemProps: {
                        label: formatMessage(messages.emailEditorNameInputLabel),
                        required: true,
                        ...fieldGridConfig
                      },
                      inputProps: {
                        placeholder: formatMessage(messages.emailEditorNameInputPlaceholder)
                      },
                      helpToolTipProps: {
                        title: 'Campaign name'
                      }
                    }}
                  />
                  <Field
                    name="campaign.technicalName"
                    component={FormInput}
                    validate={[required]}
                    props={{
                      formItemProps: {
                        label: formatMessage(messages.emailEditorTechnicalNameInputLabel),
                        required: true,
                        ...fieldGridConfig
                      },
                      inputProps: {
                        placeholder: formatMessage(messages.emailEditorTechnicalNameInputPlaceholder)
                      },
                      helpToolTipProps: {
                        title: 'Campaign technical name'
                      }
                    }}
                  />
                </Row>
              </div>
              <hr />
              <div id={'router'}>
                <Row type="flex" align="middle" justify="space-between" className="section-header">
                  <FormTitle titleMessage={messages.emailEditorRouterTitle} subTitleMessage={messages.emailEditorRouterSubTitle} />
                </Row>
                <Row>
                  <Field
                    name="campaign.routers[0].email_router_id"
                    component={FormSelect}
                    validate={[required]}
                    props={{
                      formItemProps: {
                        label: formatMessage(messages.emailEditorRouterSelectLabel),
                        required: true,
                        ...fieldGridConfig
                      },
                      options: emailRouters.map(router => ({
                        key: router.id,
                        value: router.id,
                        text: router.name
                      })),
                      helpToolTipProps: {
                        title: 'Choose your route'
                      }
                    }}
                  />
                </Row>
              </div>
              <hr />
              <div id={'blasts'}>
                <Row type="flex" align="middle" justify="space-between" className="section-header">
                  <FormTitle titleMessage={messages.emailEditorEmailBlastTitle} subTitleMessage={messages.emailEditorEmailBlastSubTitle} />
                  <Button onClick={this.handleClickOnNewBlast}>
                    New Blast
                  </Button>
                  {/* <Dropdown
                      trigger={['click']}
                      overlay={(
                        <Menu onClick={this.handleEmailBlastActionClick} className="mcs-dropdown-actions">
                          <Menu.Item key="1">New</Menu.Item>
                          <Menu.Item key="2">Add existing</Menu.Item>
                        </Menu>
                      )}>
                      <Button>
                        <McsIcons type="pen" /><McsIcons type="chevron" />
                      </Button>
                    </Dropdown>*/}
                </Row>
                <Row>
                  <RelatedRecords emptyOption={{ message: 'Add a blast man !' }}>
                    {this.getBlastRecords()}
                  </RelatedRecords>
                </Row>
              </div>
            </Content>
          </Layout>
        </Form>
      </Layout>
    );
  }
}

EmailEditor.defaultProps = {
  campaignId: null
};

EmailEditor.propTypes = {
  match: PropTypes.shape({
    url: PropTypes.string.isRequired
  }).isRequired,
  history: PropTypes.object.isRequired, // eslint-disable-line
  intl: intlShape.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  dirty: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  campaignId: PropTypes.string,
  emailEditorState: PropTypes.shape({
    blastList: PropTypes.shape({
      allIds: PropTypes.arrayOf(PropTypes.string).isRequired,
      byId: PropTypes.object.isRequired, // eslint-disable-line
    }).isRequired
  }).isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  closeNextDrawer: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  addBlast: PropTypes.func.isRequired,
  removeBlast: PropTypes.func.isRequired,
  editBlast: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => ({
  // initialValues: getEmailEditorFormInitialValues(state),
  emailEditorState: state.campaignEmailEdit.emailEditorState
});

const mapDispathToProps = {
  addBlast: actions.addBlast,
  removeBlast: actions.removeBlast,
  editBlast: actions.editBlast
};

EmailEditor = compose(
  connect(mapStateToProps, mapDispathToProps),
  reduxForm({
    form: 'emailEditor'
  }),
  injectIntl,
  withRouter
)(EmailEditor);

export default EmailEditor;

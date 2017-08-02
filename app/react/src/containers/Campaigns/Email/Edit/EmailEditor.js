import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Scrollspy from 'react-scrollspy';
import { Field, reduxForm } from 'redux-form';
import { compose } from 'recompose';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Layout, Form, Row, Button } from 'antd';

import { ReactRouterPropTypes } from '../../../../validators/proptypes';
import { withMcsRouter } from '../../../Helpers';
import { Actionbar } from '../../../Actionbar';
import McsIcons from '../../../../components/McsIcons';
import { FormInput, FormTitle, FormSelect, withValidators } from '../../../../components/Form';
import { RecordElement, RelatedRecords } from '../../../../components/RelatedRecord';
import { generateFakeId, isFakeId } from '../../../../utils/FakeIdHelper';
import messages from './messages';
import EmailBlastEditor from './EmailBlastEditor';
import EmailRouterService from '../../../../services/EmailRouterService';

const { Content, Sider } = Layout;

class EmailEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      routerOptions: [],
      blasts: [],
    };
  }

  componentDidMount() {
    const {
      match: { params: { organisationId } },
    } = this.props;

    EmailRouterService.getRouters(organisationId).then((response) => {
      this.setState({
        routerOptions: response.data,
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    const { blasts } = this.props;
    const { blasts: nextBlasts } = nextProps;
    if (nextBlasts.length !== blasts.length) {
      this.setState({ blasts: nextBlasts });
    }
  }

  handleAddBlast = ({ blast }) => {
    const { closeNextDrawer } = this.props;

    const addedBlast = {
      ...blast,
      id: generateFakeId(),
    };

    this.setState(prevState => {
      return {
        blasts: [
          ...prevState.blasts,
          addedBlast,
        ],
      };
    });

    closeNextDrawer();
  }

  handleClickOnEditBlast = (blast) => {
    const {
      openNextDrawer,
      closeNextDrawer,
    } = this.props;

    const emailBlastEditorProps = {
      save: this.handleEditBlast,
      close: closeNextDrawer,
      initialValues: { blast },
      segments: blast.segments,
    };

    const options = {
      additionalProps: emailBlastEditorProps,
    };

    openNextDrawer(EmailBlastEditor, options);
  }

  handleCliclOnNewBlast = () => {
    const { openNextDrawer, closeNextDrawer } = this.props;

    const emailBlastEditorProps = {
      save: this.handleAddBlast,
      close: closeNextDrawer,
    };

    const options = {
      additionalProps: emailBlastEditorProps,
      isModal: true,
    };

    openNextDrawer(EmailBlastEditor, options);
  }

  handleClickOnRemoveBlast = (blast) => {
    this.setState(prevState => {
      if (isFakeId(blast.id)) {
        return {
          blasts: prevState.blasts.filter(b => b.id !== blast.id),
        };
      }
      return {
        blasts: [
          ...prevState.blasts.filter(b => b.id !== blast.id),
          { ...blast, isDeleted: true },
        ],
      };
    });
  }

  handleEditBlast = ({ blast }) => {
    const { closeNextDrawer } = this.props;

    this.setState(prevState => {
      return {
        blasts: [
          ...prevState.blasts.filter(b => b.id !== blast.id),
          { ...blast, isEdited: !isFakeId(blast.id) },
        ],
      };
    });
    closeNextDrawer();
  }

  handleSaveEmailCampaign = (formValues) => {
    const { save } = this.props;
    const { blasts } = this.state;

    const emailEditorData = {
      ...formValues.campaign,
      blasts,
    };

    save(emailEditorData);
  }

  getBlastRecords() {
    const { blasts } = this.state;

    const blastRecords = blasts.filter(blast => !blast.isDeleted).map(blast => {

      return (
        <RecordElement
          key={blast.id}
          recordIconType={'email'}
          title={blast.blast_name}
          actionButtons={[
            { iconType: 'edit', onClick: () => this.handleClickOnEditBlast(blast) },
            { iconType: 'delete', onClick: () => this.handleClickOnRemoveBlast(blast) },
          ]}
        >
          <span>
            {blast.send_date.format('DD/MM/YYYY HH:mm')}
          </span>
        </RecordElement>
      );
    });

    return blastRecords;
  }

  render() {
    const {
      match: {
        url,
        params: { organisationId, campaignId },
      },
      intl: { formatMessage },
      handleSubmit,
      submitting,
      dirty,
      fieldValidators: { isRequired },
      campaignName,
    } = this.props;

    const { routerOptions } = this.state;

    const fieldGridConfig = {
      labelCol: { span: 3 },
      wrapperCol: { span: 10, offset: 1 },
    };

    const hasUnsavedChange = dirty; // dirty is for redux-form only, TODO handle wider email campaign modifiction (blasts)

    const breadcrumbPaths = [
      {
        name: formatMessage(messages.emailEditorBreadcrumbTitle1),
        url: `/v2/o/${organisationId}/campaigns/email`,
      },
      { name: `${campaignId ? formatMessage(messages.emailEditorBreadcrumbEditCampaignTitle, { campaignName: campaignName }) : formatMessage(messages.emailEditorBreadcrumbNewCampaignTitle)}${hasUnsavedChange ? '*' : ''}` },
    ];

    return (
      <Layout>
        <Form
          className="edit-layout ant-layout"
          onSubmit={handleSubmit(this.handleSaveEmailCampaign)}
        >
          <Actionbar path={breadcrumbPaths}>
            <Button type="primary" htmlType="submit" disabled={submitting}>
              <McsIcons type="plus" />
              <FormattedMessage {...messages.emailEditorSaveCampaign} />
            </Button>
            <McsIcons
              type="close"
              className="close-icon"
              style={{ cursor: 'pointer' }}
              onClick={this.props.close}
            />
          </Actionbar>
          <Layout>
            <Sider className="stepper">
              <Scrollspy
                rootEl="#emailCampaignSteps"
                items={['general', 'router', 'blasts']}
                currentClassName="currentStep"
              >
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
            <Content
              id={'emailCampaignSteps'}
              className="mcs-content-container mcs-form-container"
            >
              <div id={'general'}>
                <Row
                  type="flex"
                  align="middle"
                  justify="space-between"
                  className="section-header"
                >
                  <FormTitle
                    titleMessage={messages.emailEditorGeneralInformationTitle}
                    subTitleMessage={messages.emailEditorGeneralInformationSubTitle}
                  />
                </Row>
                <Row>
                  <Field
                    name="campaign.name"
                    component={FormInput}
                    validate={[isRequired]}
                    props={{
                      formItemProps: {
                        label: formatMessage(messages.emailEditorNameInputLabel),
                        required: true,
                        ...fieldGridConfig,
                      },
                      inputProps: {
                        placeholder: formatMessage(messages.emailEditorNameInputPlaceholder),
                      },
                      helpToolTipProps: {
                        title: 'Campaign name',
                      },
                    }}
                  />
                  <Field
                    name="campaign.technical_name"
                    component={FormInput}
                    validate={[isRequired]}
                    props={{
                      formItemProps: {
                        label: formatMessage(messages.emailEditorTechnicalNameInputLabel),
                        required: true,
                        ...fieldGridConfig,
                      },
                      inputProps: {
                        placeholder: formatMessage(messages.emailEditorTechnicalNameInputPlaceholder),
                      },
                      helpToolTipProps: {
                        title: 'Campaign technical name',
                      },
                    }}
                  />
                </Row>
              </div>
              <hr />
              <div id={'router'}>
                <Row type="flex" align="middle" justify="space-between" className="section-header">
                  <FormTitle
                    titleMessage={messages.emailEditorRouterTitle}
                    subTitleMessage={messages.emailEditorRouterSubTitle}
                  />
                </Row>
                <Row>
                  <Field
                    name="campaign.routers[0].email_router_id"
                    component={FormSelect}
                    validate={[isRequired]}
                    props={{
                      formItemProps: {
                        label: formatMessage(messages.emailEditorRouterSelectLabel),
                        required: true,
                        ...fieldGridConfig,
                      },
                      options: routerOptions.map(router => ({
                        key: router.id,
                        value: router.id,
                        text: router.name,
                      })),
                      helpToolTipProps: {
                        title: 'Choose your route',
                      },
                    }}
                  />
                </Row>
              </div>
              <hr />
              <div id={'blasts'}>
                <Row type="flex" align="middle" justify="space-between" className="section-header">
                  <FormTitle
                    titleMessage={messages.emailEditorEmailBlastTitle}
                    subTitleMessage={messages.emailEditorEmailBlastSubTitle}
                  />
                  <Button onClick={this.handleCliclOnNewBlast}>
                    New Blast
                  </Button>
                </Row>
                <Row>
                  <RelatedRecords
                    emptyOption={{ message: formatMessage(messages.emailEditorEmailBlastEmpty) }}
                  >
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
  blasts: [],
  campaignName: '',
};

EmailEditor.propTypes = {
  match: ReactRouterPropTypes.match.isRequired,
  intl: intlShape.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  dirty: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  fieldValidators: PropTypes.shape().isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  closeNextDrawer: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  campaignName: PropTypes.string,
  blasts: PropTypes.arrayOf(PropTypes.shape()),
};

EmailEditor = compose(
  injectIntl,
  withMcsRouter,
  reduxForm({
    form: 'emailEditor',
    enableReinitialize: true,
  }),
  withValidators,
)(EmailEditor);

export default EmailEditor;

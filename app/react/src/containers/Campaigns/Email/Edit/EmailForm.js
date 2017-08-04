import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { compose } from 'recompose';
import { injectIntl, intlShape } from 'react-intl';
import { Layout, Form, Row, Button } from 'antd';

import { ReactRouterPropTypes } from '../../../../validators/proptypes';
import { withMcsRouter } from '../../../Helpers';
import { FormInput, FormTitle, FormSelect, withValidators } from '../../../../components/Form';
import { RecordElement, RelatedRecords } from '../../../../components/RelatedRecord';
import { generateFakeId, isFakeId } from '../../../../utils/FakeIdHelper';
import messages from './messages';
import EmailBlastEditor from './EmailBlastEditor';
import EmailRouterService from '../../../../services/EmailRouterService';

const { Content } = Layout;

class EmailForm extends Component {
  constructor(props) {
    super(props);
    this.handleCliclOnNewBlast = this.handleCliclOnNewBlast.bind(this);
    this.handleClickOnEditBlast = this.handleClickOnEditBlast.bind(this);
    this.handleClickOnRemoveBlast = this.handleClickOnRemoveBlast.bind(this);
    this.handleAddBlast = this.handleAddBlast.bind(this);
    this.handleEditBlast = this.handleEditBlast.bind(this);
    this.handleSaveEmailCampaign = this.handleSaveEmailCampaign.bind(this);

    this.state = {
      routerOptions: [],
      blasts: []
    };
  }

  componentDidMount() {
    const {
      match: { params: { organisationId } }
    } = this.props;

    EmailRouterService.getRouters(organisationId).then((response) => {
      this.setState({
        routerOptions: response.data
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    const { blasts, sendDisableStatusToParent, submitting } = this.props;
    const { blasts: nextBlasts } = nextProps;
    if (nextBlasts.length !== blasts.length) {
      this.setState({ blasts: nextBlasts });
    }

    if (submitting !== nextProps.submitting) {
      sendDisableStatusToParent(submitting);
    }
  }

  handleAddBlast(blast) {
    const { closeNextDrawer } = this.props;

    const addedBlast = {
      ...blast,
      id: generateFakeId()
    };

    this.setState(prevState => {
      return {
        blasts: [
          ...prevState.blasts,
          addedBlast
        ]
      };
    });

    closeNextDrawer();
  }

  handleEditBlast(blast) {
    const { closeNextDrawer } = this.props;

    this.setState(prevState => {
      return {
        blasts: [
          ...prevState.blasts.filter(b => b.id !== blast.id),
          { ...blast, isEdited: !isFakeId(blast.id) }
        ]
      };
    });
    closeNextDrawer();
  }

  handleClickOnEditBlast(blast) {
    const {
      openNextDrawer,
      closeNextDrawer,
      intl: { formatMessage }
    } = this.props;

    const emailBlastEditorProps = {
      save: this.handleEditBlast,
      close: closeNextDrawer,
      initialValues: { blast },
      segments: blast.segments,
      breadcrumbPaths: [{
        name: formatMessage(
          messages.emailBlastEditorBreadcrumbTitleEditBlast,
          { blastName: blast.blast_name }
        )
      }]
    };

    const options = {
      additionalProps: emailBlastEditorProps,
      isModal: true
    };

    openNextDrawer(EmailBlastEditor, options);
  }

  handleCliclOnNewBlast() {
    const {
      openNextDrawer,
      closeNextDrawer,
      intl: { formatMessage }
    } = this.props;

    const emailBlastEditorProps = {
      save: this.handleAddBlast,
      close: closeNextDrawer,
      breadcrumbPaths: [{
        name: formatMessage(messages.emailBlastEditorBreadcrumbTitleNewBlast)
      }]
    };

    const options = {
      additionalProps: emailBlastEditorProps,
      isModal: true
    };

    openNextDrawer(EmailBlastEditor, options);
  }

  handleClickOnRemoveBlast(blast) {
    this.setState(prevState => {
      if (isFakeId(blast.id)) {
        return {
          blasts: prevState.blasts.filter(b => b.id !== blast.id)
        };
      }
      return {
        blasts: [
          ...prevState.blasts.filter(b => b.id !== blast.id),
          { ...blast, isDeleted: true }
        ]
      };
    });
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
            { iconType: 'delete', onClick: () => this.handleClickOnRemoveBlast(blast) }
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

  handleSaveEmailCampaign(formValues) {
    const { save } = this.props;
    const { blasts } = this.state;

    const emailEditorData = {
      ...formValues.campaign,
      blasts
    };

    save(emailEditorData);
  }

  render() {
    const {
      intl: { formatMessage },
      handleSubmit,
      fieldValidators: { isRequired },
    } = this.props;

    const { routerOptions } = this.state;

    const fieldGridConfig = {
      labelCol: { span: 3 },
      wrapperCol: { span: 10, offset: 1 }
    };

    // const hasUnsavedChange = dirty;
    // dirty is for redux-form only
    // TODO handle wider email campaign modification (blasts)

    return (
      <Form
        id="emailCampaignSteps"
        className="edit-layout ant-layout"
        onSubmit={handleSubmit(this.handleSaveEmailCampaign)}
      >
        <Content className="mcs-content-container mcs-form-container">
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
                    ...fieldGridConfig
                  },
                  inputProps: {
                    placeholder: formatMessage(messages.emailEditorNameInputPlaceholder)
                  },
                  helpToolTipProps: {
                    title: formatMessage(messages.emailEditorNameInputHelper)
                  }
                }}
              />
              <Field
                name="campaign.technical_name"
                component={FormInput}
                props={{
                  formItemProps: {
                    label: formatMessage(messages.emailEditorTechnicalNameInputLabel),
                    ...fieldGridConfig
                  },
                  inputProps: {
                    placeholder: formatMessage(messages.emailEditorTechnicalNameInputPlaceholder)
                  },
                  helpToolTipProps: {
                    title: formatMessage(messages.emailEditorTechnicalNameInputHelper)
                  }
                }}
              />
            </Row>
          </div>
          <hr />
          <div id={'router'}>
            <Row
              type="flex"
              align="middle"
              justify="space-between"
              className="section-header"
            >
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
                    ...fieldGridConfig
                  },
                  options: routerOptions.map(router => ({
                    key: router.id,
                    value: router.id,
                    text: router.name
                  })),
                  helpToolTipProps: {
                    title: formatMessage(messages.emailEditorRouterSelectHelper)
                  }
                }}
              />
            </Row>
          </div>
          <hr />
          <div id={'blasts'}>
            <Row
              type="flex"
              align="middle"
              justify="space-between"
              className="section-header"
            >
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
                emptyOption={{
                  message: formatMessage(messages.emailEditorEmailBlastEmpty)
                }}
              >
                {this.getBlastRecords()}
              </RelatedRecords>
            </Row>
          </div>
        </Content>
      </Form>
    );
  }
}

EmailForm.defaultProps = {
  blasts: [],
  campaignName: ''
};


EmailForm.propTypes = {
  blasts: PropTypes.arrayOf(PropTypes.shape()),
  closeNextDrawer: PropTypes.func.isRequired,
  fieldValidators: PropTypes.shape().isRequired,
  handleSubmit: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  sendDisableStatusToParent: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
};

EmailForm = compose(
  injectIntl,
  withMcsRouter,
  reduxForm({
    form: 'emailEditor',
    enableReinitialize: true
  }),
  withValidators
)(EmailForm);

export default EmailForm;

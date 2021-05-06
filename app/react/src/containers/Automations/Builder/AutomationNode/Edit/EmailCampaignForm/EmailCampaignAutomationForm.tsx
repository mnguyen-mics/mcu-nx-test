import * as React from 'react';
import { Omit, connect } from 'react-redux';
import { reduxForm, InjectedFormProps, ConfigProps, getFormValues } from 'redux-form';
import { Form } from '@ant-design/compatible';
import { Layout } from 'antd';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../../components/Layout/FormLayoutActionbar';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { McsFormSection } from '../../../../../../utils/FormHelper';
import { FORM_ID, EmailCampaignAutomationFormData } from '../domain';
import {
  BlastFormSection,
  TemplateFormSection,
} from '../../../../../Campaigns/Email/Edit/Blast/Sections';
import { BlastTemplateSectionFieldArray } from '../../../../../Campaigns/Email/Edit/Blast/EmailBlastForm';
import GeneralInformationFormSection from './GeneralInformationSectionForm';
import { MicsReduxState } from '../../../../../../utils/ReduxHelper';
import { StorylineNodeModel } from '../../../domain';

const { Content } = Layout;

const localMessages = defineMessages({
  save: {
    id: 'automation.builder.node.emailCampaignForm.save.button',
    defaultMessage: 'Update',
  },
  sectionGeneralTitle: {
    id: 'automation.builder.node.emailCampaignForm.general.title',
    defaultMessage: 'General Information',
  },
  sectionSenderInformationTitle: {
    id: 'automation.builder.node.emailCampaignForm.campaign.sender.information',
    defaultMessage: 'Sender information',
  },
});

export interface EmailCampaignAutomationFormProps
  extends Omit<ConfigProps<EmailCampaignAutomationFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: React.ReactNode[];
  storylineNodeModel: StorylineNodeModel;
  disabled?: boolean;
}

interface MapStateToProps {
  formValues: EmailCampaignAutomationFormData;
}

type Props = InjectedFormProps<EmailCampaignAutomationFormData, EmailCampaignAutomationFormProps> &
  EmailCampaignAutomationFormProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }> &
  MapStateToProps;

class EmailCampaignAutomationForm extends React.Component<Props> {
  buildFormSections = () => {
    const { change, disabled } = this.props;

    const sections: McsFormSection[] = [];

    const displayCampaignSection = {
      id: 'displayCampaign',
      title: localMessages.sectionGeneralTitle,
      component: (
        <GeneralInformationFormSection
          initialValues={this.props.initialValues}
          organisationId={this.props.match.params.organisationId}
          disabled={disabled}
        />
      ),
    };

    const senderInformation = {
      id: 'senderInformation',
      title: localMessages.sectionSenderInformationTitle,
      component: (
        <BlastFormSection
          small={true}
          disabled={disabled}
          fieldName={'blastFields[0].model.blast'}
        />
      ),
    };

    const emailTemplate = {
      id: 'emailTemplate',
      title: localMessages.sectionSenderInformationTitle,
      component: (
        <BlastTemplateSectionFieldArray
          name='blastFields[0].model.templateFields'
          component={TemplateFormSection}
          formChange={change}
          rerenderOnEveryChange={true}
          disabled={disabled}
        />
      ),
    };

    sections.push(displayCampaignSection);
    sections.push(senderInformation);
    sections.push(emailTemplate);

    return sections;
  };

  render() {
    const { breadCrumbPaths, handleSubmit, close, disabled } = this.props;
    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      pathItems: breadCrumbPaths,
      message: localMessages.save,
      onClose: close,
      disabled: disabled,
    };

    const sections = this.buildFormSections();

    const renderedSections = sections.map((section, index) => {
      return (
        <div key={section.id}>
          <div key={section.id} id={section.id}>
            {section.component}
          </div>
          {index !== sections.length - 1 && <hr />}
        </div>
      );
    });

    return (
      <Layout className='edit-layout'>
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <Form className='edit-layout ant-layout' onSubmit={handleSubmit} layout='vertical'>
            <Content
              id={FORM_ID}
              className='mcs-content-container mcs-form-container automation-form'
            >
              {renderedSections}
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  formValues: getFormValues(FORM_ID)(state),
});

export default compose<Props, EmailCampaignAutomationFormProps>(
  injectIntl,
  withRouter,
  connect(mapStateToProps),
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(EmailCampaignAutomationForm);

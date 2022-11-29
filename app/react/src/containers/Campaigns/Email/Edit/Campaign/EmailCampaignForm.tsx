import * as React from 'react';
import {
  Form,
  InjectedFormProps,
  reduxForm,
  FieldArray,
  GenericFieldArray,
  Field,
  ConfigProps,
} from 'redux-form';
import { Layout } from 'antd';
import { BasicProps } from 'antd/lib/layout/layout';

import { BlastFormSection, GeneralFormSection, RouterFormSection } from './Sections';
import { BlastFormSectionProps } from './Sections/BlastFormSection';
import { EmailCampaignFormData } from '../domain';
import messages from '../messages';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../components/Layout/FormLayoutActionbar';
import ScrollspySider, {
  SidebarWrapperProps,
} from '../../../../../components/Layout/ScrollspySider';
import { Omit } from '../../../../../utils/Types';

const Content = Layout.Content as unknown as React.ComponentClass<BasicProps & { id: string }>;
const BlastSectionFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  BlastFormSectionProps
>;

export interface EmailCampaignFormProps extends Omit<ConfigProps<EmailCampaignFormData>, 'form'> {
  save: (formData: EmailCampaignFormData) => void;
  close: () => void;
  breadCrumbPaths: React.ReactNode[];
}

type Props = InjectedFormProps<EmailCampaignFormData, EmailCampaignFormProps> &
  EmailCampaignFormProps;

const FORM_ID = 'emailCampaignForm';

class EmailCampaignForm extends React.Component<Props> {
  render() {
    const { breadCrumbPaths, handleSubmit, save, close, change } = this.props;

    const sections = {
      general: {
        sectionId: 'general',
        title: messages.emailEditorSectionTitle1,
      },
      routers: {
        sectionId: 'router',
        title: messages.emailEditorSectionTitle2,
      },
      blasts: {
        sectionId: 'blasts',
        title: messages.emailEditorSectionTitle3,
      },
    };

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      pathItems: breadCrumbPaths,
      message: messages.emailEditorSaveCampaign,
      onClose: close,
    };

    const sideBarProps: SidebarWrapperProps = {
      items: Object.values(sections),
      scrollId: FORM_ID,
    };

    return (
      <Layout className='edit-layout'>
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <ScrollspySider {...sideBarProps} />
          <Form className='edit-layout ant-layout' onSubmit={handleSubmit(save)}>
            {/* this button enables submit on enter */}
            <button type='submit' style={{ display: 'none' }} />
            <Content id={FORM_ID} className='mcs-content-container mcs-form-container'>
              <div id={sections.general.sectionId}>
                <GeneralFormSection />
              </div>
              <hr />
              <div id={sections.routers.sectionId}>
                <RouterFormSection />
              </div>
              <hr />
              <div id={sections.blasts.sectionId}>
                <BlastSectionFieldArray
                  name='blastFields'
                  component={BlastFormSection}
                  formChange={change}
                  rerenderOnEveryChange={true}
                />
              </div>
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default reduxForm<EmailCampaignFormData, EmailCampaignFormProps>({
  form: FORM_ID,
  enableReinitialize: true,
})(EmailCampaignForm);

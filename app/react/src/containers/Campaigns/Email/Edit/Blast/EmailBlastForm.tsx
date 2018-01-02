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

import {
  BlastFormSection,
  GeneralFormSection,
  SegmentFormSection,
  TemplateFormSection,
} from './Sections';
import { SegmentFormSectionProps } from './Sections/SegmentFormSection';
import { TemplateFormSectionProps } from './Sections/TemplateFormSection';
import { EmailBlastFormData } from '../domain';
import messages from '../messages';
import { DrawableContentProps } from '../../../../../components/Drawer';
import { Path } from '../../../../../components/ActionBar';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../components/Layout/FormLayoutActionbar';
import ScrollspySider, {
  SidebarWrapperProps,
} from '../../../../../components/Layout/ScrollspySider';
import { Omit } from '../../../../../utils/Types';

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
>;
const BlastTemplateSectionFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  TemplateFormSectionProps
>;
const BlastSegmentSectionFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  SegmentFormSectionProps
>;

export interface EmailBlastFormProps
  extends DrawableContentProps,
    Omit<ConfigProps<EmailBlastFormData>, 'form' > {
  save: (formData: EmailBlastFormData) => void;
  close: () => void;
  breadCrumbPaths: Path[];
}

type Props = InjectedFormProps<EmailBlastFormData, EmailBlastFormProps> &
  EmailBlastFormProps;

const FORM_ID = 'emailBlastForm';

class EmailBlastForm extends React.Component<Props> {
  render() {
    const {
      breadCrumbPaths,
      openNextDrawer,
      closeNextDrawer,
      handleSubmit,
      save,
      close,
      form,
      change,
    } = this.props;

    const sections = {
      general: {
        sectionId: 'general',
        title: messages.emailBlastEditorStepperGeneralInformation,
      },
      blast: {
        sectionId: 'blast',
        title: messages.emailBlastEditorStepperBlastInformation,
      },
      templates: {
        sectionId: 'templates',
        title: messages.emailBlastEditorStepperTemplateSelection,
      },
      segments: {
        sectionId: 'segments',
        title: messages.emailBlastEditorStepperSegmentSelection,
      },
    };

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadCrumbPaths,
      message: messages.emailEditorSave,
      onClose: close,
    };

    const sideBarProps: SidebarWrapperProps = {
      items: Object.values(sections),
      scrollId: FORM_ID,
    };

    return (
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <ScrollspySider {...sideBarProps} />
          <Form
            className="edit-layout ant-layout"
            onSubmit={handleSubmit(save)}
          >
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container"
            >
              <div id={sections.general.sectionId}>
                <GeneralFormSection />
              </div>
              <hr />
              <div id={sections.blast.sectionId}>
                <BlastFormSection />
              </div>
              <hr />
              <div id={sections.templates.sectionId}>
                <BlastTemplateSectionFieldArray
                  name="templateFields"
                  component={TemplateFormSection}
                  openNextDrawer={openNextDrawer}
                  closeNextDrawer={closeNextDrawer}
                  formChange={change}
                  rerenderOnEveryChange={true}
                />
              </div>
              <hr />
              <div id={sections.segments.sectionId}>
                <BlastSegmentSectionFieldArray
                  name="segmentFields"
                  component={SegmentFormSection}
                  openNextDrawer={openNextDrawer}
                  closeNextDrawer={closeNextDrawer}
                  formName={form}
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

export default reduxForm<EmailBlastFormData, EmailBlastFormProps>({
  form: FORM_ID,
  enableReinitialize: true,
})(EmailBlastForm);

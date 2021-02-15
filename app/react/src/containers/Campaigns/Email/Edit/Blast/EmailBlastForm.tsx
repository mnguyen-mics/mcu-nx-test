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
import { compose } from 'recompose';

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
import { Path } from '@mediarithmics-private/mcs-components-library/lib/components/action-bar/Actionbar';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../components/Layout/FormLayoutActionbar';
import ScrollspySider, {
  SidebarWrapperProps,
} from '../../../../../components/Layout/ScrollspySider';
import { Omit } from '../../../../../utils/Types';

const Content = Layout.Content as unknown as React.ComponentClass<
  BasicProps & { id: string }
>;
export const BlastTemplateSectionFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  TemplateFormSectionProps
>;
const BlastSegmentSectionFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  SegmentFormSectionProps
>;

export interface EmailBlastFormProps
  extends Omit<ConfigProps<EmailBlastFormData>, 'form'> {
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
      handleSubmit,
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
            onSubmit={handleSubmit as any}
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
                  formChange={change}
                  rerenderOnEveryChange={true}
                />
              </div>
              <hr />
              <div id={sections.segments.sectionId}>
                <BlastSegmentSectionFieldArray
                  name="segmentFields"
                  component={SegmentFormSection}
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

export default compose<Props, EmailBlastFormProps>(
  reduxForm<EmailBlastFormData, EmailBlastFormProps>({
    form: FORM_ID,
    enableReinitialize: true,
  })
)(EmailBlastForm);

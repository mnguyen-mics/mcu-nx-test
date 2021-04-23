import * as React from 'react';
import {
  FormLayoutActionbar,
  ScrollspySider,
} from '../../../../../components/Layout';
import { Layout } from 'antd';
import { Form } from '@ant-design/compatible';
import { FormLayoutActionbarProps } from '../../../../../components/Layout/FormLayoutActionbar';
import messages from '../messages';
import { ProcessingFormData } from '../domain';
import { InjectedFormProps, ConfigProps, reduxForm } from 'redux-form';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { BasicProps } from 'antd/lib/layout/layout';
import { McsFormSection } from '../../../../../utils/FormHelper';
import LegalBasisFormSection from './Sections/LegalBasisFormSection';
import GeneralFormSection from './Sections/GeneralFormSection';
import { Omit } from '../../../../../utils/Types';
import { SidebarWrapperProps } from '../../../../../components/Layout/ScrollspySider';

const Content = Layout.Content as unknown as React.ComponentClass<
  BasicProps & { id: string }
>;

export interface ProcessingEditFormProps
  extends Omit<ConfigProps<ProcessingFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: React.ReactNode[];
  goToLegalBasisSelector?: () => void;
}

type Props = InjectedFormProps<ProcessingFormData, ProcessingEditFormProps> &
  ProcessingEditFormProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

export const FORM_ID = 'processingForm';

class ProcessingEditForm extends React.Component<Props> {
  render() {
    const {
      handleSubmit,
      breadCrumbPaths,
      close,
      goToLegalBasisSelector,
    } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      pathItems: breadCrumbPaths,
      message: messages.saveProcessing,
      onClose: close,
    };

    const sections: McsFormSection[] = [];
    sections.push({
      id: 'legalBasis',
      title: messages.legalBasisSectionTitle,
      component: <LegalBasisFormSection />,
    });
    sections.push({
      id: 'general',
      title: messages.generalSectionTitle,
      component: <GeneralFormSection />,
    });

    const sideBarProps: SidebarWrapperProps = {
      items: sections.map(s => ({
        sectionId: s.id,
        title: s.title,
        onClick: s.id === 'legalBasis' ? goToLegalBasisSelector : undefined,
      })),
      scrollId: FORM_ID,
    };

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
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className="ant-layout-has-sider">
          <ScrollspySider {...sideBarProps} />
          <Form className="edit-layout ant-layout" onSubmit={handleSubmit}>
            {/* this button enables submit on enter */}
            <button type="submit" style={{ display: 'none' }} />
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container"
            >
              {renderedSections}
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<Props, ProcessingEditFormProps>(
  injectIntl,
  withRouter,
  reduxForm({ form: FORM_ID, enableReinitialize: true }),
)(ProcessingEditForm);

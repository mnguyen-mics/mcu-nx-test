import * as React from 'react';
import { reduxForm, Form, InjectedFormProps, ConfigProps } from 'redux-form';
import { compose } from 'recompose';
import { FormattedMessage } from 'react-intl';
import { Layout } from 'antd';

import {
  DisplayCreativeFormData,
  isDisplayAdResource,
  DISPLAY_CREATIVE_FORM,
} from './domain';
import messages from './messages';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../components/Layout/FormLayoutActionbar';
import { Path } from '../../../../components/ActionBar';
import ScrollspySider, {
  SidebarWrapperProps,
} from '../../../../components/Layout/ScrollspySider';
import {
  GeneralFormSection,
  AuditFormSection,
  PropertiesFormSection,
  PreviewFormSection,
} from './Sections';
import { BasicProps } from 'antd/lib/layout/layout';
import { Omit } from '../../../../utils/Types';
import { McsFormSection } from '../../../../utils/FormHelper';

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
>;

export interface DisplayCreativeFormProps
  extends Omit<ConfigProps<DisplayCreativeFormData>, 'form'> {
  close: () => void;
  actionBarButtonText: FormattedMessage.MessageDescriptor;
  breadCrumbPaths: Path[];
  goToCreativeTypeSelection?: () => void;
}

type Props = DisplayCreativeFormProps &
  InjectedFormProps<DisplayCreativeFormData, DisplayCreativeFormProps>;

class DisplayCreativeForm extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  buildFormSections = () => {
    const { initialValues } = this.props;

    const formSections: McsFormSection[] = [];

    let existingCreative = null;
    if (
      initialValues &&
      initialValues.creative &&
      isDisplayAdResource(initialValues.creative)
    ) {
      existingCreative = initialValues.creative;
    }

    formSections.push({
      id: 'general',
      title: messages.creativeSectionGeneralTitle,
      component: <GeneralFormSection />,
    });

    if (existingCreative) {
      formSections.push({
        id: 'audit_status',
        title: messages.creativeSectionAuditTitle,
        component: <AuditFormSection creativeId={existingCreative.id} />,
      });
    }

    formSections.push({
      id: 'properties',
      title: messages.creativeSectionPropertyTitle,
      component: <PropertiesFormSection />,
    });

    if (existingCreative) {
      formSections.push({
        id: 'preview',
        title: messages.creativeSectionPreviewTitle,
        component: <PreviewFormSection />,
      });
    }

    return formSections;
  };

  render() {
    const {
      handleSubmit,
      actionBarButtonText,
      breadCrumbPaths,
      close,
      goToCreativeTypeSelection,
    } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: DISPLAY_CREATIVE_FORM,
      paths: breadCrumbPaths,
      message: actionBarButtonText,
      onClose: close,
    };

    const sections = this.buildFormSections();

    const sideBarProps: SidebarWrapperProps = {
      items: sections.map(s => ({ sectionId: s.id, title: s.title })),
      scrollId: DISPLAY_CREATIVE_FORM,
    };

    if (goToCreativeTypeSelection) {
      sideBarProps.items.unshift({
        sectionId: 'type',
        title: messages.creativeSiderMenuCreativeType,
        onClick: goToCreativeTypeSelection,
        type: 'validated',
      });
    }

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
        <Layout className={'ant-layout-has-sider'}>
          <ScrollspySider {...sideBarProps} />
          <Form
            className="edit-layout ant-layout"
            onSubmit={handleSubmit as any}
          >
            <Content
              id={DISPLAY_CREATIVE_FORM}
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

export default compose<Props, DisplayCreativeFormProps>(
  reduxForm({
    form: DISPLAY_CREATIVE_FORM,
    enableReinitialize: true,
  }),
)(DisplayCreativeForm);

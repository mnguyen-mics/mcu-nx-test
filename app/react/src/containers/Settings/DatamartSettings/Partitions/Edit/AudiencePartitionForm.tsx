import * as React from 'react';
import { Layout } from 'antd';
import { Form, InjectedFormProps, ConfigProps, reduxForm } from 'redux-form';
import { defineMessages } from 'react-intl';
import { compose } from 'recompose';
import { BasicProps } from 'antd/lib/layout/layout';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../components/Layout/FormLayoutActionbar';
import { Path } from '../../../../../components/ActionBar';

import ScrollspySider, {
  SidebarWrapperProps,
} from '../../../../../components/Layout/ScrollspySider';
import { McsFormSection } from '../../../../../utils/FormHelper';
import GeneralFormSection from './Sections/GeneralFormSection';
import { AudiencePartitionFormData } from './domain';
import { Omit } from '../../../../../utils/Types';

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
>;

const FORM_ID = 'partitionForm';

const messages = defineMessages({
  savePartition: {
    id: 'edit.partition.form.save.button',
    defaultMessage: 'Save',
  },
  sectionTitleGeneral: {
    id: 'edit.partition.form.sectionTitleGeneral',
    defaultMessage: 'General Informations',
  },
});

interface AudiencePartitionFormProps
  extends Omit<ConfigProps<AudiencePartitionFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: Path[];
}

interface AudiencePartitionFormState {}

type JoinedProps = AudiencePartitionFormProps &
  InjectedFormProps<AudiencePartitionFormData, AudiencePartitionFormProps>;

class AudiencePartitionForm extends React.Component<
  JoinedProps,
  AudiencePartitionFormState
> {
  buildFormSections = () => {
    const {} = this.props;

    const sections: McsFormSection[] = [];

    const general = {
      id: 'general',
      title: messages.sectionTitleGeneral,
      component: (
        <GeneralFormSection initialValues={this.props.initialValues} />
      ),
    };

    sections.push(general);

    return sections;
  };

  render() {
    const { breadCrumbPaths, handleSubmit, close } = this.props;
    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadCrumbPaths,
      message: messages.savePartition,
      onClose: close,
    };
    const sections = this.buildFormSections();
    const sideBarProps: SidebarWrapperProps = {
      items: sections.map(s => ({ sectionId: s.id, title: s.title })),
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
              <div className="ad-group-form">{renderedSections}</div>
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<JoinedProps, AudiencePartitionFormProps>(
  reduxForm<AudiencePartitionFormData, AudiencePartitionFormProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(AudiencePartitionForm);

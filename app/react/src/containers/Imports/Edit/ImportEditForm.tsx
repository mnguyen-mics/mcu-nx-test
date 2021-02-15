import * as React from 'react';
import { Layout } from 'antd';
import { compose } from 'recompose';
import { Form, reduxForm, InjectedFormProps, ConfigProps } from 'redux-form';
import { BasicProps } from 'antd/lib/layout/layout';
import { withRouter, RouteComponentProps } from 'react-router';
import { InjectedIntlProps, defineMessages, injectIntl } from 'react-intl';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../components/Layout/FormLayoutActionbar';
import ScrollspySider, {
  SidebarWrapperProps,
} from '../../../components/Layout/ScrollspySider';
import { McsFormSection } from '../../../utils/FormHelper';
import { Path } from '@mediarithmics-private/mcs-components-library/lib/components/action-bar/Actionbar';
import GeneralFormSection from './Sections/GeneralFormSection';
import { Import } from '../../../models/imports/imports';
import { Omit } from '../../../utils/Types';

export const FORM_ID = 'importForm';

const Content = Layout.Content as unknown as React.ComponentClass<
  BasicProps & { id: string }
>;

const messages = defineMessages({
  sectionTitleGeneral: {
    id: 'imports.form.general',
    defaultMessage: 'General Information',
  },
  saveImport: {
    id: 'save.import',
    defaultMessage: 'Save',
  },
  editImport: {
    id: 'imports.form.edit.title',
    defaultMessage: 'Edit {name}',
  },
});

interface ImportEditFormProps
  extends Omit<ConfigProps<Partial<Import>>, 'form'> {
  onClose: () => void;
  onSave: (formData: Partial<Import>) => void;
  breadCrumbPaths: Path[];
}

type Props = InjectedFormProps<Partial<Import>, ImportEditFormProps> &
  ImportEditFormProps &
  RouteComponentProps<{
    organisationId: string;
    datamartId: string;
    exportId: string;
  }> &
  InjectedIntlProps;

class ImportEditForm extends React.Component<Props> {
  buildFormSections = () => {
    const sections: McsFormSection[] = [];
    const general = {
      id: 'general',
      title: messages.sectionTitleGeneral,
      component: <GeneralFormSection />,
    };

    sections.push(general);
    return sections;
  };

  render() {
    const { handleSubmit, onSave } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: this.props.breadCrumbPaths,
      message: messages.saveImport,
      onClose: this.props.onClose,
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
            onSubmit={handleSubmit(onSave as any) as any}
          >
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container"
            >
              <div className="placement-list-form">{renderedSections}</div>
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<Props, ImportEditFormProps>(
  withRouter,
  injectIntl,
  reduxForm<Partial<Import>, ImportEditFormProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(ImportEditForm);

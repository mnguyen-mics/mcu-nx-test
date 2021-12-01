import * as React from 'react';
import { Layout } from 'antd';
import { compose } from 'recompose';
import { Form, reduxForm, InjectedFormProps, ConfigProps } from 'redux-form';
import { BasicProps } from 'antd/lib/layout/layout';
import { withRouter, RouteComponentProps } from 'react-router';
import { InjectedIntlProps, defineMessages, injectIntl } from 'react-intl';

import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../components/Layout/FormLayoutActionbar';
import ScrollspySider, {
  SidebarWrapperProps,
} from '../../../../../components/Layout/ScrollspySider';
import { McsFormSection } from '../../../../../utils/FormHelper';
import GeneralFormSection from './Sections/GeneralFormSection';
import RoleFormSection from '../../UserRoles/Edit/Sections/RoleInfoFormSection';
import { Omit } from '../../../../../utils/Types';
import UserResource from '../../../../../models/directory/UserResource';

const FORM_ID = 'userForm';

const Content = Layout.Content as unknown as React.ComponentClass<BasicProps & { id: string }>;

const messages = defineMessages({
  sectionTitleGeneral: {
    id: 'settings.organisation.users.edit.generalInformationSection.title',
    defaultMessage: 'General Information',
  },
  sectionTitleRole: {
    id: 'settings.organisation.users.edit.roleInformationSection.title',
    defaultMessage: 'Role Information',
  },
  saveUser: {
    id: 'settings.organisation.users.edit.saveButton',
    defaultMessage: 'Save User',
  },
});

interface EditUserFormProps extends Omit<ConfigProps<Partial<UserResource>>, 'form'> {
  onClose: () => void;
  onSave: (formData: Partial<UserResource>) => void;
  breadCrumbPaths: React.ReactNode[];
}

type Props = InjectedFormProps<Partial<UserResource>, EditUserFormProps> &
  EditUserFormProps &
  RouteComponentProps<{ organisationId: string; userId: string }> &
  InjectedIntlProps;

class EditUserForm extends React.Component<Props> {
  buildFormSections = () => {
    const sections: McsFormSection[] = [];
    const general = {
      id: 'general',
      title: messages.sectionTitleGeneral,
      component: <GeneralFormSection />,
    };
    const role = {
      id: 'role',
      title: messages.sectionTitleRole,
      component: <RoleFormSection />,
    };
    sections.push(general);
    sections.push(role);
    return sections;
  };

  render() {
    const { handleSubmit, onSave } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      pathItems: this.props.breadCrumbPaths,
      message: messages.saveUser,
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
      <Layout className='edit-layout'>
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <ScrollspySider {...sideBarProps} />
          <Form className='edit-layout ant-layout' onSubmit={handleSubmit(onSave) as any}>
            {/* this button enables submit on enter */}
            <button type='submit' style={{ display: 'none' }} />
            <Content id={FORM_ID} className='mcs-content-container mcs-form-container'>
              <div className='placement-list-form'>{renderedSections}</div>
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<Props, EditUserFormProps>(
  withRouter,
  injectIntl,
  reduxForm<Partial<UserResource>, EditUserFormProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(EditUserForm);

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
import { Omit } from '../../../../../utils/Types';
import UserResource from '../../../../../models/directory/UserResource';
import { UserWithRole } from '../domain';
import UserInfoFormSection from './Sections/UserInfoFormSection';
import RoleInfoFormSection from './Sections/RoleInfoFormSection';

const FORM_ID = 'userRoleForm';

const Content = (Layout.Content as unknown) as React.ComponentClass<BasicProps & { id: string }>;

const messages = defineMessages({
  sectionTitleUserInfo: {
    id: 'settings.organisation.users.role.edit.userInformationSection.title',
    defaultMessage: 'User Information',
  },
  sectionTitleRoleInfo: {
    id: 'settings.organisation.users.role.edit.roleInformationSection.title',
    defaultMessage: 'Role Information',
  },
  saveUserRole: {
    id: 'settings.organisation.users.role.edit.saveButton',
    defaultMessage: 'Save User Role',
  },
});

interface EditUserRoleFormProps extends Omit<ConfigProps<Partial<UserResource>>, 'form'> {
  onClose: () => void;
  onSave: (formData: Partial<UserResource>) => void;
  breadCrumbPaths: React.ReactNode[];
}

type Props = InjectedFormProps<Partial<UserResource>, EditUserRoleFormProps> &
  EditUserRoleFormProps &
  RouteComponentProps<{ organisationId: string; userId: string }> &
  InjectedIntlProps;

class EditUserRoleForm extends React.Component<Props> {
  render() {
    const { handleSubmit, onSave } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      pathItems: this.props.breadCrumbPaths,
      message: messages.saveUserRole,
      onClose: this.props.onClose,
    };

    const sections: McsFormSection[] = [
      {
        id: 'userInfo',
        title: messages.sectionTitleUserInfo,
        component: <UserInfoFormSection />,
      },
      {
        id: 'roleInfo',
        title: messages.sectionTitleRoleInfo,
        component: <RoleInfoFormSection />,
      },
    ];

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

export default compose<Props, EditUserRoleFormProps>(
  withRouter,
  injectIntl,
  reduxForm<Partial<UserWithRole>, EditUserRoleFormProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(EditUserRoleForm);

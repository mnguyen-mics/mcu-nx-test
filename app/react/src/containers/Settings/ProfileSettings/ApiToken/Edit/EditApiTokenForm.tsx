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
import { Path } from '@mediarithmics-private/mcs-components-library/lib/components/action-bar/Actionbar';
import GeneralFormSection from './Sections/GeneralFormSection';
import { Omit } from '../../../../../utils/Types';
import ApiTokenResource from '../../../../../models/directory/ApiTokenResource';

const FORM_ID = 'userForm';

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
>;

const messages = defineMessages({
  sectionTitleGeneral: {
    id: 'settings.profile.apiToken.edit.generalInfoSection.title',
    defaultMessage: 'General Information',
  },
  saveApiToken: {
    id: 'settings.profile.apiToken.edit.saveButton',
    defaultMessage: 'Save Api Token',
  },
});

interface EditUserFormProps
  extends Omit<ConfigProps<Partial<ApiTokenResource>>, 'form'> {
  onClose: () => void;
  onSave: (formData: Partial<ApiTokenResource>) => void;
  breadCrumbPaths: Path[];
}

type Props = InjectedFormProps<Partial<ApiTokenResource>, EditUserFormProps> &
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
    sections.push(general);
    return sections;
  };

  render() {
    const { handleSubmit, onSave } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: this.props.breadCrumbPaths,
      message: messages.saveApiToken,
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
            onSubmit={handleSubmit(onSave) as any}
          >
            {/* this button enables submit on enter */}
            <button type="submit" style={{ display: 'none' }} />
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

export default compose<Props, EditUserFormProps>(
  withRouter,
  injectIntl,
  reduxForm<Partial<ApiTokenResource>, EditUserFormProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(EditUserForm);

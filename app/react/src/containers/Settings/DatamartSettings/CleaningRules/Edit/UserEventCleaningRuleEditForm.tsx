import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { reduxForm, InjectedFormProps, ConfigProps } from 'redux-form';
import { compose } from 'recompose';
import { UserEventCleaningRuleFormData } from './domain';
import { Path } from '../../../../../components/ActionBar';
import { Layout, Form } from 'antd';
import {
  FormLayoutActionbar,
  ScrollspySider,
} from '../../../../../components/Layout';
import { BasicProps } from 'antd/lib/layout/layout';
import {
  SidebarWrapperProps,
  SideBarItem,
} from '../../../../../components/Layout/ScrollspySider';
import { McsFormSection } from '../../../../../utils/FormHelper';
import messages from './messages';
import { FormLayoutActionbarProps } from '../../../../../components/Layout/FormLayoutActionbar';
import ActionFormSection from './Sections/ActionFormSection';
import ScopeFormSection from './Sections/ScopeFormSection';
import { Omit } from '../../../../../utils/Types';
import { OptionProps } from 'antd/lib/select';

export const FORM_ID = 'userEventCleaningRuleForm';

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
>;

export interface UserEventCleaningRuleEditFormProps
  extends Omit<ConfigProps<UserEventCleaningRuleFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: Path[];
  goToDatamartSelector: () => void;
  datamartId: string;
  channelOptions: OptionProps[];
}

type Props = InjectedFormProps<
  UserEventCleaningRuleFormData,
  UserEventCleaningRuleEditFormProps
> &
  UserEventCleaningRuleEditFormProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class UserEventCleaningRuleEditForm extends React.Component<Props> {
  render() {
    const {
      // handleSubmit,
      breadCrumbPaths,
      close,
      goToDatamartSelector,
      channelOptions
    } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadCrumbPaths,
      // message: messages.saveUserEventCleaningRule,
      onClose: close,
    };

    const sections: McsFormSection[] = [];

    sections.push({
      id: 'action',
      title: messages.sectionActionTitle,
      component: <ActionFormSection />,
    });

    sections.push({
      id: 'scope',
      title: messages.sectionScopeTitle,
      component: <ScopeFormSection channelOptions={channelOptions}/>,
    });

    const datamartSideBarItem: SideBarItem = {
      sectionId: 'datamart',
      title: messages.sectionDatamartTitle,
      onClick: goToDatamartSelector,
    };

    const sideBarProps: SidebarWrapperProps = {
      items: [datamartSideBarItem].concat(
        sections.map(s => ({
          sectionId: s.id,
          title: s.title,
          onClick: undefined,
        })),
      ),
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
          <Form
            className="edit-layout ant-layout"
            // submit temporarily disabled
            // onSubmit={handleSubmit as any}
          >
            {/* This button enables submit on enter */}
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

export default compose<Props, UserEventCleaningRuleEditFormProps>(
  injectIntl,
  withRouter,
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(UserEventCleaningRuleEditForm);

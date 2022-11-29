import * as React from 'react';
import { Layout } from 'antd';
import { Form } from '@ant-design/compatible';
import { BasicProps } from 'antd/lib/layout/layout';
import { ConfigProps, InjectedFormProps, reduxForm } from 'redux-form';
import { CleaningRuleFormData } from './domain';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { CleaningRuleType } from '../../../../../models/cleaningRules/CleaningRules';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../components/Layout/FormLayoutActionbar';
import messages from './messages';
import { McsFormSection } from '../../../../../utils/FormHelper';
import ActionFormSection from './Sections/ActionFormSection';
import ScopeFormSection from './Sections/ScopeFormSection';
import ScrollspySider, {
  SideBarItem,
  SidebarWrapperProps,
} from '../../../../../components/Layout/ScrollspySider';
import { Omit } from '../../../../../utils/Types';
import { DefaultOptionProps } from '../../../../../components/Form/FormSelect/DefaultSelect';

export const FORM_ID = 'cleaningRuleForm';

const Content = Layout.Content as unknown as React.ComponentClass<BasicProps & { id: string }>;

export interface CleaningRuleEditFormProps extends Omit<ConfigProps<CleaningRuleFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: React.ReactNode[];
  goToDatamartSelector: () => void;
  datamartId: string;
  options: DefaultOptionProps[];
  cleaningRuleType: CleaningRuleType;
}

type Props = InjectedFormProps<CleaningRuleFormData, CleaningRuleEditFormProps> &
  CleaningRuleEditFormProps &
  WrappedComponentProps &
  RouteComponentProps<{ organisationId: string }>;

class CleaningRuleEditForm extends React.Component<Props> {
  render() {
    const {
      handleSubmit,
      breadCrumbPaths,
      close,
      goToDatamartSelector,
      options,
      cleaningRuleType,
      change,
    } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      pathItems: breadCrumbPaths,
      message:
        cleaningRuleType === 'USER_EVENT_CLEANING_RULE'
          ? messages.saveUserEventCleaningRule
          : messages.saveUserProfileCleaningRule,
      onClose: close,
    };

    const sections: McsFormSection[] = [];

    sections.push({
      id: 'action',
      title: messages.sectionActionTitle,
      component: <ActionFormSection cleaningRuleType={cleaningRuleType} />,
    });

    sections.push({
      id: 'scope',
      title: messages.sectionScopeTitle,
      component: (
        <ScopeFormSection
          options={options}
          cleaningRuleType={cleaningRuleType}
          formChange={change}
        />
      ),
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
      <Layout className='edit-layout'>
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className='ant-layout-has-sider mcs-legacy_form_container'>
          <ScrollspySider {...sideBarProps} />
          <Form className='edit-layout ant-layout' onSubmit={handleSubmit}>
            {/* This button enables submit on enter */}
            <button type='submit' style={{ display: 'none' }} />
            <Content id={FORM_ID} className='mcs-content-container mcs-form-container'>
              {renderedSections}
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<Props, CleaningRuleEditFormProps>(
  injectIntl,
  withRouter,
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(CleaningRuleEditForm);

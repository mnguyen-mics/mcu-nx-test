import * as React from 'react';
import {
  Form,
  reduxForm,
  InjectedFormProps,
  ConfigProps,
  GenericFieldArray,
  Field,
  FieldArray,
} from 'redux-form';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Layout } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { BasicProps } from 'antd/lib/layout/layout';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Path } from '../../../../../components/ActionBar';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../components/Layout/FormLayoutActionbar';
import ScrollspySider, {
  SidebarWrapperProps,
} from '../../../../../components/Layout/ScrollspySider';
import messages from './messages';
import { SiteFormData } from './domain';
import { Omit } from '../../../../../utils/Types';
import GeneralFormSection from './Sections/GeneralFormSection';
import { McsFormSection } from '../../../../../utils/FormHelper';

import VisitAnalyzerSection, {
  VisitAnalyzerSectionProps,
} from '../../Common/VisitAnalyzerFormSection';

import EventRulesSection, {
  EventRulesSectionProps,
} from '../../Common/EventRulesSection';

import * as SessionSelectors from '../../../../../state/Session/selectors';

import DomainsField, { DomainFieldProps } from './Sections/DomainsField';

const FormDomainFields = FieldArray as new () => GenericFieldArray<
  DomainFieldProps
>;

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
>;

const VisitAnalyzerFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  VisitAnalyzerSectionProps
>;

const EventRulesFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  EventRulesSectionProps
>;

export interface SiteEditFormProps
  extends Omit<ConfigProps<SiteFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: Path[];
}

interface MapStateToProps {
  hasDatamarts: (organisationId: string) => boolean;
}

type Props = InjectedFormProps<SiteFormData, SiteEditFormProps> &
  SiteEditFormProps &
  MapStateToProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

const FORM_ID = 'siteForm';

class SiteEditForm extends React.Component<Props> {
  onKeyPress = (event: any) => {
    if (event && event.which === 13 /* Enter */) {
      event.preventDefault();
    }
  };

  render() {
    const { handleSubmit, breadCrumbPaths, close, change } = this.props;

    const genericFieldArrayProps = {
      formChange: change,
      rerenderOnEveryChange: true,
    };

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadCrumbPaths,
      message: messages.saveSite,
      onClose: close,
    };

    const sections: McsFormSection[] = [];
    sections.push({
      id: 'general',
      title: messages.sectionGeneralTitle,
      component: <GeneralFormSection />,
    });

    sections.push({
      id: 'aliases',
      title: messages.sectionAliasesTitle,
      component: (
        <FormDomainFields
          name={'aliases'}
          component={DomainsField}
          {...genericFieldArrayProps}
        />
      ),
    });

    sections.push({
      id: 'eventRules',
      title: messages.sectionEventRulesTitle,
      component: (
        <EventRulesFieldArray
          name="eventRulesFields"
          component={EventRulesSection}
          {...genericFieldArrayProps}
        />
      ),
    });

    sections.push({
      id: 'visitAnalyzer',
      title: messages.sectionVisitAnalyzer,
      component: (
        <VisitAnalyzerFieldArray
          name="visitAnalyzerFields"
          component={VisitAnalyzerSection}
          {...genericFieldArrayProps}
        />
      ),
    });

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
            onKeyPress={this.onKeyPress}
          >
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

export default compose<Props, SiteEditFormProps>(
  injectIntl,
  withRouter,
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
  connect(state => ({ hasDatamarts: SessionSelectors.hasDatamarts(state) })),
)(SiteEditForm);

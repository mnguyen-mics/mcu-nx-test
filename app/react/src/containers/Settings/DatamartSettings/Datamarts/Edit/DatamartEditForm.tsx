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
import { Layout } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { BasicProps } from 'antd/lib/layout/layout';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../components/Layout/FormLayoutActionbar';
import ScrollspySider, {
  SidebarWrapperProps,
} from '../../../../../components/Layout/ScrollspySider';
import messages from './messages';
import { DatamartFormData } from './domain';
import { Omit } from '../../../../../utils/Types';
import GeneralFormSection from './Sections/GeneralSectionForm';
import { McsFormSection } from '../../../../../utils/FormHelper';

import EventRulesSection, {
  EventRulesSectionProps,
} from '../../Common/EventRulesSection';

const Content = Layout.Content as unknown as React.ComponentClass<
  BasicProps & { id: string }
>;

const EventRulesFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  EventRulesSectionProps
>;

export interface DatamartEditFormProps
  extends Omit<ConfigProps<DatamartFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: React.ReactNode[];
  datamartId: string;
  isCrossDatamart: boolean;
}

type Props = InjectedFormProps<DatamartFormData, DatamartEditFormProps> &
  DatamartEditFormProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

export const FORM_ID = 'datamartForm';

class DatamartEditForm extends React.Component<Props> {
  generateSections = (isCrossDatamart: boolean) => {
    const sections: McsFormSection[] = [
      {
        id: 'general',
        title: messages.sectionGeneralTitle,
        component: <GeneralFormSection isCrossDatamart={isCrossDatamart} />,
      },
    ];

    const genericFieldArrayProps = {
      formChange: this.props.change,
      rerenderOnEveryChange: true,
    };

    if (!isCrossDatamart) {
      sections.push({
        id: 'eventRules',
        title: messages.sectionEventRulesTitle,
        component: (
          <EventRulesFieldArray
            name="eventRulesFields"
            component={EventRulesSection}
            datamartId={this.props.datamartId}
            {...genericFieldArrayProps}
          />
        ),
      });
    }
    return sections;
  };

  render() {
    const {
      handleSubmit,
      breadCrumbPaths,
      close,
      isCrossDatamart,
    } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      pathItems: breadCrumbPaths,
      message: messages.saveDatamart,
      onClose: close,
    };

    const sections = this.generateSections(isCrossDatamart);

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
              {renderedSections}
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<Props, DatamartEditFormProps>(
  injectIntl,
  withRouter,
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(DatamartEditForm);

import * as React from 'react';
import { Omit, connect } from 'react-redux';
import {
  reduxForm,
  InjectedFormProps,
  ConfigProps,
  getFormValues,
} from 'redux-form';
import { Path } from '../../../../../components/ActionBar';
import { Layout, Form } from 'antd';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../components/Layout/FormLayoutActionbar';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { McsFormSection } from '../../../../../utils/FormHelper';
import { AutomationNodeFormData, FORM_ID } from './domain';
import GeneralFormSection from './GeneralFormSection';

const { Content } = Layout;

const messages = defineMessages({
  save: {
    id: 'automation.builder.node.form.save.button',
    defaultMessage: 'Update',
  },
  sectionGeneralTitle: {
    id: 'automation.builder.node.edition.form.general.title',
    defaultMessage: 'General Informations',
  },
});

export interface AutomationNodeFormProps
  extends Omit<ConfigProps<AutomationNodeFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: Path[];
  update: (formData: AutomationNodeFormData) => void;
}

interface MapStateToProps {
  formValues: AutomationNodeFormData;
}

type Props = InjectedFormProps<
  AutomationNodeFormData,
  AutomationNodeFormProps
> &
  AutomationNodeFormProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }> &
  MapStateToProps;

class AutomationNodeForm extends React.Component<Props> {
  buildFormSections = () => {
    const {} = this.props;

    const sections: McsFormSection[] = [];

    const general = {
      id: 'general',
      title: messages.sectionGeneralTitle,
      component: <GeneralFormSection />,
    };

    sections.push(general);

    return sections;
  };

  render() {
    const { breadCrumbPaths, handleSubmit, update, close } = this.props;
    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadCrumbPaths,
      message: messages.save,
      onClose: close,
    };
    const sections = this.buildFormSections();

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
          <Form
            className="edit-layout ant-layout"
            onSubmit={handleSubmit(update) as any}
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

const mapStateToProps = (state: any) => ({
  formValues: getFormValues(FORM_ID)(state),
});

export default compose<Props, AutomationNodeFormProps>(
  injectIntl,
  withRouter,
  connect(mapStateToProps),
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(AutomationNodeForm);

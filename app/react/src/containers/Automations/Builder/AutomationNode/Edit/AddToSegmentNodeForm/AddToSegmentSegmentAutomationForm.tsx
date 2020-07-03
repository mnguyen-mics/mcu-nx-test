import {
  ConfigProps,
  InjectedFormProps,
  getFormValues,
  reduxForm,
} from 'redux-form';
import { FORM_ID, AddToSegmentAutomationFormData } from '../domain';
import { Path } from '../../../../../../components/ActionBar';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import * as React from 'react';
import { MicsReduxState } from '../../../../../../utils/ReduxHelper';
import { Omit, connect } from 'react-redux';
import { compose } from 'recompose';
import { Layout, Form } from 'antd';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../../components/Layout/FormLayoutActionbar';
import { McsFormSection } from '../../../../../../utils/FormHelper';
import GeneralInformationFormSection from './AddToSegmentGeneralInformationSectionForm';
import { StorylineNodeModel } from '../../../domain';

const { Content } = Layout;

const messages = defineMessages({
  save: {
    id: 'automation.builder.node.addToSegmentForm.save.button',
    defaultMessage: 'Update',
  },
  sectionGeneralTitle: {
    id: 'automation.builder.node.addToSegmentForm.general.title',
    defaultMessage: 'General Informations',
  },
});

export interface AddToSegmentAutomationFormProps
  extends Omit<ConfigProps<AddToSegmentAutomationFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: Path[];
  storylineNodeModel: StorylineNodeModel;
  disabled?: boolean;
}

interface MapStateToProps {
  formValues: AddToSegmentAutomationFormData;
}

type Props = InjectedFormProps<
  AddToSegmentAutomationFormData,
  AddToSegmentAutomationFormProps
> &
  AddToSegmentAutomationFormProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }> &
  MapStateToProps;

class AddToSegmentAutomationForm extends React.Component<Props> {
  buildFormSections = () => {
    const { disabled } = this.props;

    const sections: McsFormSection[] = [];

    const addToSegmentSection = {
      id: 'addToSegmentSectionId',
      title: messages.sectionGeneralTitle,
      component: (
        <GeneralInformationFormSection
          initialValues={this.props.initialValues}
          organisationId={this.props.match.params.organisationId}
          disabled={disabled}
        />
      ),
    };

    sections.push(addToSegmentSection);

    return sections;
  };

  render() {
    const { breadCrumbPaths, handleSubmit, close, disabled } = this.props;
    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadCrumbPaths,
      message: messages.save,
      onClose: close,
      disabled: disabled,
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
            onSubmit={handleSubmit}
            layout="vertical"
          >
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container automation-form"
            >
              {renderedSections}
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  formValues: getFormValues(FORM_ID)(state),
});

export default compose<Props, AddToSegmentAutomationFormProps>(
  injectIntl,
  withRouter,
  connect(mapStateToProps),
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(AddToSegmentAutomationForm);

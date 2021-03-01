import {
  ConfigProps,
  InjectedFormProps,
  getFormValues,
  reduxForm,
  FieldArray,
  GenericFieldArray,
  Field,
} from 'redux-form';
import { FORM_ID, AddToSegmentAutomationFormData } from '../domain';
import { Path } from '@mediarithmics-private/mcs-components-library/lib/components/action-bar/Actionbar';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import * as React from 'react';
import { MicsReduxState } from '../../../../../../utils/ReduxHelper';
import { Omit, connect } from 'react-redux';
import { compose } from 'recompose';
import { Layout } from 'antd';
import { Form } from '@ant-design/compatible';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../../components/Layout/FormLayoutActionbar';
import { McsFormSection } from '../../../../../../utils/FormHelper';
import GeneralInformationFormSection from './AddToSegmentGeneralInformationSectionForm';
import { StorylineNodeModel } from '../../../domain';
import ProcessingActivitiesFormSection, { ProcessingActivitiesFormSectionProps } from '../../../../../Settings/DatamartSettings/Common/ProcessingActivitiesFormSection';

const { Content } = Layout;

const ProcessingActivitiesFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  ProcessingActivitiesFormSectionProps
>;

const messages = defineMessages({
  save: {
    id: 'automation.builder.node.addToSegmentForm.save.button',
    defaultMessage: 'Update',
  },
  sectionGeneralTitle: {
    id: 'automation.builder.node.addToSegmentForm.general.title',
    defaultMessage: 'General Information',
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
    const { disabled, change } = this.props;

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

    const userChoicesSection = {
      id: 'processingActivities',
      title: messages.sectionGeneralTitle,
      component: (
        <ProcessingActivitiesFieldArray
          name="processingActivities"
          component={ProcessingActivitiesFormSection}
          initialProcessingSelectionsForWarning={[]}
          processingsAssociatedType={'ADD-TO-SEGMENT-AUTOMATION'}
          formChange={change}
          disabled={disabled}
        />
      ),
    };

    sections.push(userChoicesSection)

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

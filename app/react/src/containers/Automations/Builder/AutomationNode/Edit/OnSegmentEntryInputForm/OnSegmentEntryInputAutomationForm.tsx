import { ConfigProps, InjectedFormProps, getFormValues, reduxForm } from 'redux-form';
import { FORM_ID, OnSegmentEntryInputAutomationFormData } from '../domain';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
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
import OnSegmentEntryInputGeneralSectionForm from './OnSegmentEntryInputGeneralSectionForm';
import { StorylineNodeModel } from '../../../domain';

const { Content } = Layout;

const messages = defineMessages({
  save: {
    id: 'automation.builder.node.onSegmentEntryInputForm.save.button',
    defaultMessage: 'Update',
  },
  sectionGeneralTitle: {
    id: 'automation.builder.node.onSegmentEntryInputForm.general.title',
    defaultMessage: 'General Information',
  },
});

export interface OnSegmentEntryInputAutomationFormProps
  extends Omit<ConfigProps<OnSegmentEntryInputAutomationFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: React.ReactNode[];
  storylineNodeModel: StorylineNodeModel;
  disabled?: boolean;
}

interface MapStateToProps {
  formValues: OnSegmentEntryInputAutomationFormData;
}

type Props = InjectedFormProps<
  OnSegmentEntryInputAutomationFormData,
  OnSegmentEntryInputAutomationFormProps
> &
  OnSegmentEntryInputAutomationFormProps &
  InjectedIntlProps &
  MapStateToProps;

class OnSegmentEntryInputAutomationForm extends React.Component<Props> {
  buildFormSections = () => {
    const { disabled } = this.props;

    const sections: McsFormSection[] = [];

    const OnSegmentEntryInputSection = {
      id: 'OnSegmentEntryInputSectionId',
      title: messages.sectionGeneralTitle,
      component: (
        <OnSegmentEntryInputGeneralSectionForm
          initialValues={this.props.initialValues}
          disabled={disabled}
        />
      ),
    };

    sections.push(OnSegmentEntryInputSection);

    return sections;
  };

  render() {
    const { breadCrumbPaths, handleSubmit, close, disabled } = this.props;
    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      pathItems: breadCrumbPaths,
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
      <Layout className='edit-layout'>
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <Form className='edit-layout ant-layout' onSubmit={handleSubmit} layout='vertical'>
            <Content
              id={FORM_ID}
              className='mcs-content-container mcs-form-container automation-form'
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

export default compose<Props, OnSegmentEntryInputAutomationFormProps>(
  injectIntl,
  connect(mapStateToProps),
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(OnSegmentEntryInputAutomationForm);

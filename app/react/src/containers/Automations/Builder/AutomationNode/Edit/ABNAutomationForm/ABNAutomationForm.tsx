import * as React from 'react';
import { Omit, connect } from 'react-redux';
import { reduxForm, InjectedFormProps, ConfigProps, getFormValues } from 'redux-form';
import { Layout } from 'antd';
import { Form } from '@ant-design/compatible';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../../components/Layout/FormLayoutActionbar';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { McsFormSection } from '../../../../../../utils/FormHelper';
import { FORM_ID, ABNFormData } from '../domain';
import GeneralInformationFormSection from './GeneralInformationFormSection';
import { MicsReduxState } from '../../../../../../utils/ReduxHelper';
import { StorylineNodeModel } from '../../../domain';

const { Content } = Layout;

const localMessages = defineMessages({
  save: {
    id: 'automation.builder.abnNode.form.save.button',
    defaultMessage: 'Update',
  },
  sectionGeneralTitle: {
    id: 'automation.builder.abnNode.edition.form.general.title',
    defaultMessage: 'General Information',
  },
});

export interface ABNAutomationFormProps extends Omit<ConfigProps<ABNFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: React.ReactNode[];
  storylineNodeModel: StorylineNodeModel;
  disabled?: boolean;
}

interface MapStateToProps {
  formValues: ABNFormData;
}

type Props = InjectedFormProps<ABNFormData, ABNAutomationFormProps> &
  ABNAutomationFormProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }> &
  MapStateToProps;

class ABNAutomationForm extends React.Component<Props> {
  buildFormSections = () => {
    const { disabled } = this.props;
    const general = {
      id: 'general',
      title: localMessages.sectionGeneralTitle,
      component: (
        <GeneralInformationFormSection
          disabled={disabled}
          initialValues={this.props.initialValues}
        />
      ),
    };

    const sections: McsFormSection[] = [general];

    return sections;
  };

  render() {
    const { breadCrumbPaths, handleSubmit, close, disabled } = this.props;
    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      pathItems: breadCrumbPaths,
      message: localMessages.save,
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
        <Layout className={'ant-layout-has-sider mcs-legacy_form_container'}>
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

export default compose<Props, ABNAutomationFormProps>(
  injectIntl,
  withRouter,
  connect(mapStateToProps),
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(ABNAutomationForm);

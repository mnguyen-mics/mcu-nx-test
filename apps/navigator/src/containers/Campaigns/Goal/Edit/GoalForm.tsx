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
import { BasicProps } from 'antd/lib/layout/layout';
import { WrappedComponentProps } from 'react-intl';

import {
  GeneralFormSection,
  ConversionValueFormSection,
  TriggerFormSection,
  AttributionModelFormSection,
} from './Sections';
import { GoalFormData } from './domain';
import messages from './messages';
import { Omit } from '../../../../utils/Types';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../components/Layout/FormLayoutActionbar';
import ScrollspySider, { SidebarWrapperProps } from '../../../../components/Layout/ScrollspySider';
import { ReduxFormChangeProps } from '../../../../utils/FormHelper';
import { DatamartResource } from '../../../../models/datamart/DatamartResource';

const Content = Layout.Content as unknown as React.ComponentClass<BasicProps & { id: string }>;

const AttributionModelFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  ReduxFormChangeProps
>;

export interface GoalFormProps extends Omit<ConfigProps<GoalFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: React.ReactNode[];
  datamart: DatamartResource;
  goToTriggerTypeSelection?: () => void;
}

type Props = InjectedFormProps<GoalFormData, GoalFormProps> & GoalFormProps & WrappedComponentProps;

export const FORM_ID = 'goalForm';

class GoalForm extends React.Component<Props> {
  render() {
    const { breadCrumbPaths, handleSubmit, close, goToTriggerTypeSelection } = this.props;

    const sections = {
      general: {
        sectionId: 'general',
        title: messages.sectionTitle1,
      },
      conversion_value: {
        sectionId: 'conversion_value',
        title: messages.sectionTitle2,
      },
      trigger: {
        sectionId: 'trigger',
        title: messages.sectionTitle3,
      },
      attribution_models: {
        sectionId: 'attribution_models',
        title: messages.sectionTitle4,
      },
    };

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      pathItems: breadCrumbPaths,
      message: messages.saveGoal,
      onClose: close,
    };

    const sideBarProps: SidebarWrapperProps = {
      items: Object.values(sections),
      scrollId: FORM_ID,
    };

    if (goToTriggerTypeSelection) {
      sideBarProps.items.unshift({
        sectionId: 'type',
        title: messages.goalFormSiderMenuTriggerType,
        onClick: goToTriggerTypeSelection,
        type: 'validated',
      });
    }

    return (
      <Layout className='edit-layout'>
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <ScrollspySider {...sideBarProps} />
          <Form className='edit-layout ant-layout' onSubmit={handleSubmit as any}>
            {/* this button enables submit on enter */}
            <button type='submit' style={{ display: 'none' }} />
            <Content id={FORM_ID} className='mcs-content-container mcs-form-container'>
              <div id={sections.general.sectionId}>
                <GeneralFormSection />
              </div>
              <hr />
              <div id={sections.conversion_value.sectionId}>
                <ConversionValueFormSection
                  initialValues={this.props.initialValues}
                  formChange={this.props.change}
                />
              </div>
              <hr />
              <div id={sections.trigger.sectionId}>
                <TriggerFormSection
                  initialValues={this.props.initialValues}
                  formChange={this.props.change}
                  datamart={this.props.datamart}
                />
              </div>
              <hr />
              <div id={sections.attribution_models.sectionId}>
                <AttributionModelFieldArray
                  name='attributionModels'
                  component={AttributionModelFormSection}
                  formChange={this.props.change}
                  rerenderOnEveryChange={true}
                />
              </div>
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<Props, GoalFormProps>(
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(GoalForm);

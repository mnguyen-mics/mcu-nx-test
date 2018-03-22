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
import { InjectedIntlProps } from 'react-intl';

import {
  GeneralFormSection,
  ConversionValueFormSection,
  TriggerFormSection,
  AttributionModelFormSection,
} from './Sections';
import { NewGoalFormData } from './domain';
import messages from './messages';
import { Path } from '../../../../components/ActionBar';
import { Omit } from '../../../../utils/Types';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../components/Layout/FormLayoutActionbar';
import ScrollspySider, {
  SidebarWrapperProps,
} from '../../../../components/Layout/ScrollspySider';
import { ReduxFormChangeProps } from '../../../../utils/FormHelper';

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
>;

const AttributionModelFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  ReduxFormChangeProps
>;

export interface GoalFormProps
  extends Omit<ConfigProps<NewGoalFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: Path[];
  goalId?: string;
}

type Props = InjectedFormProps<NewGoalFormData, GoalFormProps> &
  GoalFormProps &
  InjectedIntlProps;

const FORM_ID = 'goalForm';

class GoalForm extends React.Component<Props> {
  render() {
    const {
      breadCrumbPaths,
      handleSubmit,
      close,
      goalId,
      initialValues: { queryContainer, queryLanguage },
    } = this.props;

    const queryObject = {
      queryContainer: queryContainer,
      queryLanguage: queryLanguage,
    };

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
      paths: breadCrumbPaths,
      message: messages.saveGoal,
      onClose: close,
    };

    const sideBarProps: SidebarWrapperProps = {
      items: Object.values(sections),
      scrollId: FORM_ID,
    };

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
              <div id={sections.general.sectionId}>
                <GeneralFormSection />
              </div>
              <hr />
              <div id={sections.conversion_value.sectionId}>
                <ConversionValueFormSection
                  goalId={goalId}
                  initialValues={this.props.initialValues}
                  formChange={this.props.change}
                />
              </div>
              {queryObject && (
                <div>
                  <hr />
                  <div id={sections.trigger.sectionId}>
                    <TriggerFormSection
                      goalId={goalId}
                      queryObject={queryObject}
                    />
                  </div>
                </div>
              )}
              <hr />
              <div id={sections.attribution_models.sectionId}>
                <AttributionModelFieldArray
                  name="attributionModels"
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

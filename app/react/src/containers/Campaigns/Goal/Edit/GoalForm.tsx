import * as React from 'react';
import { Form, reduxForm, InjectedFormProps, ConfigProps } from 'redux-form';
import { compose } from 'recompose';
import { Layout } from 'antd';
import { BasicProps } from 'antd/lib/layout/layout';

import { GeneralFormSection, AttributionFormSection } from './Sections';
import { GoalFormData } from './domain';
import messages from './messages';
import { Path } from '../../../../components/ActionBar';
import { Omit } from '../../../../utils/Types';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../components/Layout/FormLayoutActionbar';
import ScrollspySider, {
  SidebarWrapperProps,
} from '../../../../components/Layout/ScrollspySider';

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
>;

export interface GoalFormProps extends Omit<ConfigProps<GoalFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: Path[];
}

type Props = InjectedFormProps<GoalFormData, GoalFormProps> & GoalFormProps;

const FORM_ID = 'goalForm';

class GoalForm extends React.Component<Props> {
  render() {
    const { breadCrumbPaths, handleSubmit, close } = this.props;

    const sections = {
      general: {
        sectionId: 'general',
        title: messages.sectionTitle1,
      },
      goals: {
        sectionId: 'goals',
        title: messages.sectionTitle2,
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
            {/* this button enables submit on enter */}
            <button type="submit" style={{ display: 'none' }} />
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container"
            >
              <div id={sections.general.sectionId}>
                <GeneralFormSection />
              </div>
              <hr />
              <div id={sections.general.sectionId}>
                <AttributionFormSection />
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

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
import { Layout, message } from 'antd';
import { BasicProps } from 'antd/lib/layout/layout';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { DrawableContentProps } from '../../../../components/Drawer';
import { Path } from '../../../../components/ActionBar';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../components/Layout/FormLayoutActionbar';
import ScrollspySider, {
  SidebarWrapperProps,
} from '../../../../components/Layout/ScrollspySider';
import messages from './messages';
import { DisplayCampaignFormData } from './domain';
import { Omit } from '../../../../utils/Types';
import GeneralFormSection from './Sections/GeneralFormSection';
import { McsFormSection } from '../../../../utils/FormHelper';
import GoalFormSection, {
  GoalFormSectionProps,
} from './Sections/GoalFormSection';
import AdGroupFormSection, {
  AdGroupFormSectionProps,
} from './Sections/AdGroupFormSection';

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
>;

const GoalFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  GoalFormSectionProps
>;

const AdGroupFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  AdGroupFormSectionProps
>;

export interface DisplayCampaignFormProps
  extends DrawableContentProps,
    Omit<ConfigProps<DisplayCampaignFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: Path[];
}

type Props = InjectedFormProps<
  DisplayCampaignFormData,
  DisplayCampaignFormProps
> &
  DisplayCampaignFormProps &
  InjectedIntlProps;

const FORM_ID = 'campaignForm';

class DisplayCampaignForm extends React.Component<Props> {
  componentWillReceiveProps(nextProps: Props) {
    // const { submitFailed } = this.props;
    const { intl: { formatMessage } } = this.props;
    const { submitFailed: nextSubmitFailed } = nextProps;
    if (nextSubmitFailed) {
      message.error(formatMessage(messages.errorFormMessage));
    }
  }

  render() {
    const {
      closeNextDrawer,
      openNextDrawer,
      handleSubmit,
      breadCrumbPaths,
      close,
      change,
    } = this.props;

    const genericFieldArrayProps = {
      formChange: change,
      openNextDrawer,
      closeNextDrawer,
    };

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadCrumbPaths,
      message: messages.saveAdGroup,
      onClose: close,
    };

    const sections: McsFormSection[] = [];
    sections.push({
      id: 'general',
      title: messages.sectionTitle1,
      component: <GeneralFormSection />,
    });

    sections.push({
      id: 'goals',
      title: messages.sectionTitle2,
      component: (
        <GoalFieldArray
          name="goalFields"
          component={GoalFormSection}
          {...genericFieldArrayProps}
        />
      ),
    });

    sections.push({
      id: 'adGroups',
      title: messages.sectionTitle3,
      component: (
        <AdGroupFieldArray
          name="adGroupFields"
          component={AdGroupFormSection}
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
          <Form className="edit-layout ant-layout" onSubmit={handleSubmit}>
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

export default compose<Props, DisplayCampaignFormProps>(
  injectIntl,
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(DisplayCampaignForm);

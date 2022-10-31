import * as React from 'react';
import { DisplayCampaignFormData } from './domain';
import {
  ConfigProps,
  reduxForm,
  InjectedFormProps,
  Form,
  GenericFieldArray,
  Field,
  FieldArray,
} from 'redux-form';
import { Omit } from '../../../../utils/Types';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import { Layout } from 'antd';
import { FormLayoutActionbar, ScrollspySider } from '../../../../components/Layout';
import { SidebarWrapperProps } from '../../../../components/Layout/ScrollspySider';
import { FormLayoutActionbarProps } from '../../../../components/Layout/FormLayoutActionbar';
import { McsFormSection } from '../../../../utils/FormHelper';
import { GeneralFormSection } from './Sections/AdServing';
import messages from './messages';
import AdGroupAdsFormSection, {
  AdGroupAdsFormSectionProps,
} from './Sections/AdServing/AdGroupAdsFormSection';

const { Content } = Layout;

export interface DisplayAdServingCampaignFormProps
  extends Omit<ConfigProps<DisplayCampaignFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: React.ReactNode[];
}

type Props = InjectedFormProps<DisplayCampaignFormData, DisplayAdServingCampaignFormProps> &
  DisplayAdServingCampaignFormProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

export const FORM_ID = 'campaignForm';

const AdGroupAdsFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  AdGroupAdsFormSectionProps
>;

class DisplayAdServingCampaignForm extends React.Component<Props, any> {
  public render() {
    const { handleSubmit, breadCrumbPaths, close, change } = this.props;

    const genericFieldArrayProps = {
      formChange: change,
      rerenderOnEveryChange: true,
    };

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      pathItems: breadCrumbPaths,
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
      id: 'ads',
      title: messages.sectionTitle3,
      component: (
        <AdGroupAdsFieldArray
          name='adGroupFields'
          component={AdGroupAdsFormSection}
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
      <Layout className='edit-layout'>
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <ScrollspySider {...sideBarProps} />
          <Form className='edit-layout ant-layout' onSubmit={handleSubmit as any}>
            {/* this button enables submit on enter */}
            <button type='submit' style={{ display: 'none' }} />
            <Content id={FORM_ID} className='mcs-content-container mcs-form-container'>
              <div className='ad-group-form'>{renderedSections}</div>
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<Props, DisplayAdServingCampaignFormProps>(
  injectIntl,
  withRouter,
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(DisplayAdServingCampaignForm);

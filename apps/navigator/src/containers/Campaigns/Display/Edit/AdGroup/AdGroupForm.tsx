import * as React from 'react';
import {
  Form,
  reduxForm,
  ConfigProps,
  InjectedFormProps,
  GenericFieldArray,
  Field,
  FieldArray,
} from 'redux-form';
import { connect } from 'react-redux';
import { Layout } from 'antd';
import { BasicProps } from 'antd/lib/layout/layout';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import messages from '../messages';
import { AdGroupFormData, EditAdGroupRouteMatchParam } from './domain';
import { Omit } from '../../../../../utils/Types';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../components/Layout/FormLayoutActionbar';
import ScrollspySider, {
  SidebarWrapperProps,
} from '../../../../../components/Layout/ScrollspySider';
import { GeneralFormSection } from './sections';
import { SummaryFormSection } from './sections/Summary';
import LocationTargetingFormSection, {
  LocationTargetingFormSectionProps,
} from './sections/Location/LocationTargetingFormSection';
import AudienceSegmentFormSection, {
  AudienceSegmentFormSectionProps,
} from './sections/AudienceSegment/AudienceSegmentFormSection';
import * as SessionSelectors from '../../../../../redux/Session/selectors';
import { McsFormSection } from '../../../../../utils/FormHelper';
import AdFormSection, { AdFormSectionProps } from './sections/AdFormSection';
import DeviceFormSection from './sections/DeviceFormSection';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';

const Content = Layout.Content as unknown as React.ComponentClass<BasicProps & { id: string }>;

const AudienceSegmentFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  AudienceSegmentFormSectionProps
>;

export const LocationTargetingFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  LocationTargetingFormSectionProps
>;

export const AdFieldArray = FieldArray as new () => GenericFieldArray<Field, AdFormSectionProps>;

export interface AdGroupFormProps extends Omit<ConfigProps<AdGroupFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: React.ReactNode[];
}

interface MapStateToProps {
  hasDatamarts: (organisationId: string) => boolean;
}

type Props = InjectedFormProps<AdGroupFormData, AdGroupFormProps> &
  AdGroupFormProps &
  MapStateToProps &
  RouteComponentProps<EditAdGroupRouteMatchParam>;

export const FORM_ID = 'adGroupForm';

class AdGroupForm extends React.Component<Props> {
  buildFormSections = () => {
    const {
      match: {
        params: { organisationId },
      },
      change,
      initialValues,
      hasDatamarts,
    } = this.props;

    const genericFieldArrayProps = {
      formChange: change,
      rerenderOnEveryChange: true,
    };

    const displaySummaryFirst = !!(initialValues.adGroup && initialValues.adGroup.name);

    const sections: McsFormSection[] = [];

    const general = {
      id: 'general',
      title: messages.sectionTitleGeneral,
      component: <GeneralFormSection />,
    };
    const summary = {
      id: 'summary',
      title: messages.sectionTitleSummary,
      component: <SummaryFormSection />,
    };
    const audience = {
      id: 'audience',
      title: messages.sectionTitleAudience,
      component: (
        <AudienceSegmentFieldArray
          name='segmentFields'
          component={AudienceSegmentFormSection}
          {...genericFieldArrayProps}
        />
      ),
    };
    const location = {
      id: 'location',
      title: messages.sectionTitleLocationTargeting,
      component: (
        <LocationTargetingFieldArray
          name='locationFields'
          component={LocationTargetingFormSection}
          {...genericFieldArrayProps}
        />
      ),
    };
    const device = {
      id: 'device',
      title: messages.sectionTitleDevice,
      component: (
        <DeviceFormSection
          formChange={this.props.change}
          initialValues={this.props.initialValues.adGroup}
        />
      ),
    };
    const displayAd = {
      id: 'display',
      title: messages.sectionTitleAds,
      component: (
        <AdFieldArray name='adFields' component={AdFormSection} {...genericFieldArrayProps} />
      ),
    };

    sections.push(general);
    if (hasDatamarts(organisationId)) sections.push(audience);
    sections.push(device);
    sections.push(location);
    sections.push(displayAd);

    const insertIndex = displaySummaryFirst ? 0 : sections.length;
    sections.splice(insertIndex, 0, summary);

    return sections;
  };

  render() {
    const { breadCrumbPaths, handleSubmit, close } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      pathItems: breadCrumbPaths,
      message: messages.saveAdGroup,
      onClose: close,
    };

    const sections = this.buildFormSections();

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

export default compose<Props, AdGroupFormProps>(
  withRouter,
  reduxForm<AdGroupFormData, AdGroupFormProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
  connect((state: MicsReduxState) => ({
    hasDatamarts: SessionSelectors.hasDatamarts(state),
  })),
)(AdGroupForm);

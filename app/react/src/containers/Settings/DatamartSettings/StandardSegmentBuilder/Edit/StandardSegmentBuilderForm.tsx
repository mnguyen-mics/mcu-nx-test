import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { Layout } from 'antd';
import { FormLayoutActionbar, ScrollspySider } from '../../../../../components/Layout';
import { STANDARD_SEGMENT_BUILDER_FORM_ID, StandardSegmentBuilderFormData } from './domain';
import {
  ConfigProps,
  Form,
  InjectedFormProps,
  reduxForm,
  Field,
  FieldArray,
  GenericFieldArray,
} from 'redux-form';
import { FormLayoutActionbarProps } from '../../../../../components/Layout/FormLayoutActionbar';
import { McsFormSection } from '../../../../../utils/FormHelper';
import StandardSegmentBuilderGeneralSection from './Sections/StandardSegmentBuilderGeneralSection';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import { messages } from '../messages';
import { compose } from 'recompose';
import StandardSegmentBuilderInitialFeatureSection, {
  StandardSegmentBuilderInitialFeatureSectionProps,
} from './Sections/StandardSegmentBuilderInitialFeatureSection';
import { SidebarWrapperProps } from '../../../../../components/Layout/ScrollspySider';

const Content = Layout.Content;

export interface StandardSegmentBuilderFormProps
  extends Omit<ConfigProps<StandardSegmentBuilderFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: React.ReactNode[];
}

const InitialAudienceFeaturesFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  StandardSegmentBuilderInitialFeatureSectionProps
>;

interface MapStateToProps {
  formValues?: StandardSegmentBuilderFormData;
}

type Props = InjectedFormProps<StandardSegmentBuilderFormData, StandardSegmentBuilderFormProps> &
  StandardSegmentBuilderFormProps &
  MapStateToProps &
  WrappedComponentProps;

class StandardSegmentBuilderForm extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    const { handleSubmit, breadCrumbPaths, change, close } = this.props;

    const genericFieldArrayProps = {
      formChange: change,
      rerenderOnEveryChange: true,
    };

    const actionBarProps: FormLayoutActionbarProps = {
      formId: STANDARD_SEGMENT_BUILDER_FORM_ID,
      pathItems: breadCrumbPaths,
      message: messages.standardSegmentBuilderSave,
      onClose: close,
    };

    const sections: McsFormSection[] = [];

    sections.push({
      id: 'general',
      title: messages.standardSegmentBuilderSectionGeneralTitle,
      component: <StandardSegmentBuilderGeneralSection />,
    });

    sections.push({
      id: 'demographics',
      title: messages.standardSegmentBuilderSectionDemographicsTitle,
      component: (
        <InitialAudienceFeaturesFieldArray
          name='initialAudienceFeatures'
          component={StandardSegmentBuilderInitialFeatureSection}
          {...genericFieldArrayProps}
        />
      ),
    });

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

    const sideBarProps: SidebarWrapperProps = {
      items: sections.map(s => ({ sectionId: s.id, title: s.title })),
      scrollId: STANDARD_SEGMENT_BUILDER_FORM_ID,
    };

    return (
      <Layout className='edit-layout'>
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <ScrollspySider {...sideBarProps} />
          <Form className='edit-layout ant-layout' onSubmit={handleSubmit as any}>
            {/* this button enables submit on enter */}
            <button type='submit' style={{ display: 'none' }} />
            <Content
              id={STANDARD_SEGMENT_BUILDER_FORM_ID}
              className='mcs-content-container mcs-form-container'
            >
              <div className='mcs-standardSegmentBuilder_formColumn'>{renderedSections}</div>
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<Props, StandardSegmentBuilderFormProps>(
  injectIntl,
  withRouter,
  reduxForm({
    form: STANDARD_SEGMENT_BUILDER_FORM_ID,
    enableReinitialize: true,
  }),
)(StandardSegmentBuilderForm);

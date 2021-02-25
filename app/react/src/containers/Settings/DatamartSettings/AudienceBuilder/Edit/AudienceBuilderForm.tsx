import * as React from 'react';
import { withRouter } from 'react-router';
import { Layout } from 'antd';
import {
  FormLayoutActionbar,
  ScrollspySider,
} from '../../../../../components/Layout';
import { AUDIENCE_BUILDER_FORM_ID, AudienceBuilderFormData } from './domain';
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
import AudienceBuilderGeneralSection from './Sections/AudienceBuilderGeneralSection';
import { Path } from '@mediarithmics-private/mcs-components-library/lib/components/action-bar/Actionbar';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { messages } from '../messages';
import { compose } from 'recompose';
import AudienceBuilderDemographicsSection, {
  DemographicsFormSectionProps,
} from './Sections/AudienceBuilderDemographicsSection';
import { SidebarWrapperProps } from '../../../../../components/Layout/ScrollspySider';

const Content = Layout.Content;

export interface AudienceBuilderFormProps
  extends Omit<ConfigProps<AudienceBuilderFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: Path[];
}

const DemographicsFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  DemographicsFormSectionProps
>;

interface MapStateToProps {
  formValues?: AudienceBuilderFormData;
}

type Props = InjectedFormProps<
  AudienceBuilderFormData,
  AudienceBuilderFormProps
> &
  AudienceBuilderFormProps &
  MapStateToProps &
  InjectedIntlProps;

class AudienceBuilderForm extends React.Component<Props> {
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
      formId: AUDIENCE_BUILDER_FORM_ID,
      paths: breadCrumbPaths,
      message: messages.audienceBuilderSave,
      onClose: close,
    };

    const sections: McsFormSection[] = [];

    sections.push({
      id: 'general',
      title: messages.audienceBuilderSectionGeneralTitle,
      component: <AudienceBuilderGeneralSection />,
    });

    sections.push({
      id: 'demographics',
      title: messages.audienceBuilderSectionDemographicsTitle,
      component: (
        <DemographicsFieldArray
          name="audienceFeatureDemographics"
          component={AudienceBuilderDemographicsSection}
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
      scrollId: AUDIENCE_BUILDER_FORM_ID,
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
              id={AUDIENCE_BUILDER_FORM_ID}
              className="mcs-content-container mcs-form-container"
            >
              <div className="mcs-audienceBuilder_formColumn">
                {renderedSections}
              </div>
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<Props, AudienceBuilderFormProps>(
  injectIntl,
  withRouter,
  reduxForm({
    form: AUDIENCE_BUILDER_FORM_ID,
    enableReinitialize: true,
  }),
)(AudienceBuilderForm);

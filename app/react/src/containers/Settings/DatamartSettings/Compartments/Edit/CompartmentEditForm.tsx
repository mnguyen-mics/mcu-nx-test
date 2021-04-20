import * as React from 'react';
import { CompartmentFormData } from './domain';
import {
  InjectedFormProps,
  ConfigProps,
  reduxForm,
  Form,
  FieldArray,
  GenericFieldArray,
  Field,
} from 'redux-form';
import { Omit } from '../../../../../utils/Types';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { Layout } from 'antd';
import {
  FormLayoutActionbar,
  ScrollspySider,
} from '../../../../../components/Layout';
import { BasicProps } from 'antd/lib/layout/layout';
import {
  SidebarWrapperProps,
  SideBarItem,
} from '../../../../../components/Layout/ScrollspySider';
import { McsFormSection } from '../../../../../utils/FormHelper';
import messages from './messages';
import { FormLayoutActionbarProps } from '../../../../../components/Layout/FormLayoutActionbar';
import GeneralFormSection from './Sections/GeneralFormSection';
import { ProcessingSelectionResource } from '../../../../../models/processing';
import { InjectedFeaturesProps, injectFeatures } from '../../../../Features';
import ProcessingActivitiesFormSection, {
  ProcessingActivitiesFormSectionProps,
} from '../../Common/ProcessingActivitiesFormSection';

export const FORM_ID = 'compartmentForm';

const Content = Layout.Content as unknown as React.ComponentClass<
  BasicProps & { id: string }
>;

const ProcessingActivitiesFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  ProcessingActivitiesFormSectionProps
>;

export interface CompartmentEditFormProps
  extends Omit<ConfigProps<CompartmentFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: React.ReactNode[];
  datamartId: string;
  goToDatamartSelector: () => void;
  initialProcessingSelectionsForWarning?: ProcessingSelectionResource[];
}

type Props = InjectedFormProps<CompartmentFormData, CompartmentEditFormProps> &
  CompartmentEditFormProps &
  InjectedIntlProps &
  InjectedFeaturesProps &
  RouteComponentProps<{ organisationId: string }>;

class CompartmentEditForm extends React.Component<Props> {
  render() {
    const {
      handleSubmit,
      breadCrumbPaths,
      close,
      change,
      hasFeature,
      goToDatamartSelector,
      initialProcessingSelectionsForWarning,
    } = this.props;

    const genericFieldArrayProps = {
      formChange: change,
      rerenderOnEveryChange: true,
    };

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      pathItems: breadCrumbPaths,
      message: messages.saveCompartment,
      onClose: close,
    };

    const sections: McsFormSection[] = [];

    sections.push({
      id: 'general',
      title: messages.sectionGeneralTitle,
      component: <GeneralFormSection />,
    });

    if (hasFeature('datamart-user_choices')) {
      sections.push({
        id: 'processingActivities',
        title: messages.sectionProcessingActivitiesTitle,
        component: (
          <ProcessingActivitiesFieldArray
            name="processingActivities"
            component={ProcessingActivitiesFormSection}
            initialProcessingSelectionsForWarning={
              initialProcessingSelectionsForWarning
            }
            processingsAssociatedType={'COMPARTMENT'}
            {...genericFieldArrayProps}
          />
        ),
      });
    }

    const datamartSideBarItem: SideBarItem = {
      sectionId: 'datamart',
      title: messages.sectionDatamartTitle,
      onClick: goToDatamartSelector,
    };

    const sideBarProps: SidebarWrapperProps = {
      items: [datamartSideBarItem].concat(
        sections.map(s => ({
          sectionId: s.id,
          title: s.title,
          onClick: undefined,
        })),
      ),
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
        <Layout className="ant-layout-has-sider">
          <ScrollspySider {...sideBarProps} />
          <Form
            className="edit-layout ant-layout"
            onSubmit={handleSubmit as any}
          >
            {/* This button enables submit on enter */}
            <button type="submit" style={{ display: 'none' }} />
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

export default compose<Props, CompartmentEditFormProps>(
  injectIntl,
  injectFeatures,
  withRouter,
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(CompartmentEditForm);

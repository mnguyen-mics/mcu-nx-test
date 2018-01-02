import * as React from 'react';
import { reduxForm, Form, InjectedFormProps, ConfigProps } from 'redux-form';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { Layout } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';

import { DisplayCreativeFormData, isDisplayAdResource } from './domain';
import * as actions from '../../../../state/Notifications/actions';
import messages from './messages';
import {  withValidators } from '../../../../components/Form';
import { ValidatorProps } from '../../../../components/Form/withValidators';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../components/Layout/FormLayoutActionbar';
import { Path } from '../../../../components/ActionBar';
import ScrollspySider, {
  SidebarWrapperProps,
} from '../../../../components/Layout/ScrollspySider';
import {
  GeneralFormSection,
  AuditFormSection,
  PropertiesFormSection,
  PreviewFormSection,
} from './Sections';
import { DrawableContentProps } from '../../../../components/Drawer/index';
import { BasicProps } from 'antd/lib/layout/layout';
import { Omit } from '../../../../utils/Types';
import { PropertyResourceShape } from '../../../../models/plugin';

const Content = Layout.Content as React.ComponentClass<
BasicProps & { id: string }
>;

const FORM_ID = 'displayCreativeForm';

export interface DisplayCreativeFormProps 
  extends DrawableContentProps,
    Omit<ConfigProps<DisplayCreativeFormData>, 'form' > {
  actionBarButtonText:  FormattedMessage.MessageDescriptor;
  save: (formData: DisplayCreativeFormData) => void;
  close: React.MouseEventHandler<HTMLSpanElement>;
  breadCrumbPaths: Path[];
  refreshCreative?: (organisationId: string, creativeId: string) => void;
}

interface DisplayCreativeFormState {
  editionMode: boolean;
}

export interface FormSectionProps {
  id: string,
  title: FormattedMessage.MessageDescriptor,
  component : React.ReactNode
}

type JoinedProps = DisplayCreativeFormProps &
  ValidatorProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedFormProps<DisplayCreativeFormData>;

class DisplayCreativeForm extends React.Component<
  JoinedProps,
  DisplayCreativeFormState
> {
  constructor(props: JoinedProps) {
    super(props);
  }

  render() {
    const {
			initialValues,
			handleSubmit,
      actionBarButtonText,
      save,
      refreshCreative,
      close,
    } = this.props;
    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: [{
        name: messages.creativeEditionBreadCrumb,
      }],
      message: actionBarButtonText,
      onClose: close,
    };

		const formSections: FormSectionProps[] = [];
    
    let existingCreative = null;
    if (initialValues && 
			initialValues.creative && 
			isDisplayAdResource(initialValues.creative)) {
        existingCreative = initialValues.creative;
      }

		formSections.push({
			id: 'general',
			title: messages.creativeSectionGeneralTitle,
			component: <GeneralFormSection />
    });
  
		
		if (existingCreative && refreshCreative) {
				formSections.push({
          id: 'audit_status',
          title: messages.creativeSectionAuditTitle,
          component: (
            <AuditFormSection
              creative={existingCreative}
              mode="card"
              refreshCreative={refreshCreative}
            />
          )		
        });
      }

      formSections.push({
        id: 'properties',
        title: messages.creativeSectionPropertyTitle,
        component: (
          <PropertiesFormSection
            creative={existingCreative ? existingCreative : undefined}
            rendererProperties={rendererProperties}
            rendererVersionId={rendererVersionId}
          />
        )
      });

      if (existingCreative) {
				formSections.push({
          id: 'preview',
          title: messages.creativeSectionPreviewTitle,
          component: (
            <PreviewFormSection
              creative={existingCreative}
              rendererProperties={rendererProperties}
            />				
          )
        });
      }
      
      const sideBarProps: SidebarWrapperProps = {
        items: formSections.map(section => ({ sectionId: section.id, title: section.title })),
        scrollId: FORM_ID,
      };

    return (
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>

          <ScrollspySider {...sideBarProps} />
          <Form
            className="edit-layout ant-layout"
            onSubmit={handleSubmit(save)}
          >
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container"
            >
              
						{ formSections.map(section => {
							return (
								<div key={section.id}>
									<div id={section.id}>
										{section.component}
									</div>
									<hr />
								</div>
							);
            })}

            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<JoinedProps, DisplayCreativeFormProps>(
  withRouter,
  injectIntl,
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
  withValidators,
  connect(undefined, { notifyError: actions.notifyError }),
)(DisplayCreativeForm);

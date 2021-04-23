import * as React from 'react';
import { reduxForm, InjectedFormProps, ConfigProps } from 'redux-form';
import { compose } from 'recompose';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';

import {
  DisplayCreativeFormData,
  DISPLAY_CREATIVE_FORM,
  isExistingCreative,
} from './domain';
import messages from './messages';
import CustomLoaderPlaceholder from './CustomLoaders/CustomLoaderPlaceholder';
import NotSupportedPlaceholder from './CustomLoaders/NotSupportedPlaceholder';
import {
  GeneralFormSection,
  AuditFormSection,
  PropertiesFormSection,
  PreviewFormSection,
} from './Sections';
import { Omit } from '../../../../utils/Types';
import { McsFormSection } from '../../../../utils/FormHelper';
import DisplayCreativeFormLayout from './DisplayCreativeFormLayout';


export interface DisplayCreativeFormProps
  extends Omit<ConfigProps<DisplayCreativeFormData>, 'form'> {
  close: () => void;
  actionBarButtonText: FormattedMessage.MessageDescriptor;
  breadCrumbPaths: React.ReactNode[];
  goToCreativeTypeSelection?: () => void;
}

type Props = DisplayCreativeFormProps &
  InjectedFormProps<DisplayCreativeFormData, DisplayCreativeFormProps> & InjectedIntlProps;

class DisplayCreativeForm extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  

  buildFormSections = () => {
    const { initialValues } = this.props;

    const leftFormSections: McsFormSection[] = [];
    const rightFormSections: McsFormSection[] = [];

    const existingCreative = isExistingCreative(initialValues);

    rightFormSections.push({
      id: 'general',
      title: messages.creativeSectionGeneralTitle,
      component: <GeneralFormSection small={true} />,
    });

    if (existingCreative) {
      leftFormSections.push({
        id: 'audit_status',
        title: messages.creativeSectionAuditTitle,
        component: <AuditFormSection creativeId={existingCreative.id} />,
      });
    }


    if (initialValues.pluginLayout === undefined) {

      rightFormSections.push({
        id: 'properties',
        title: messages.creativeSectionPropertyTitle,
        component: <PropertiesFormSection small={true} />,
      });
    } else {
      initialValues.pluginLayout.sections.forEach(section => {
        rightFormSections.push({
          id: section.title,
          title: section.title,
          component: <PropertiesFormSection sectionTitle={section.title} small={true}/>,
        });
      })
    }

    if (existingCreative) {
      leftFormSections.push(
        {
          id: 'preview',
          title: messages.creativeSectionPreviewTitle,
          component: initialValues.rendererPlugin && initialValues.rendererPlugin.archived ? <NotSupportedPlaceholder /> : <PreviewFormSection />,
        });
    }

    if (!existingCreative) {
      leftFormSections.push({
        id: 'no-loader',
        title: messages.creativeSectionPreviewTitle,
        component: <CustomLoaderPlaceholder />,
      });
    }

    return {
      leftPanel: leftFormSections,
      rightPanel: rightFormSections
    };
  }; 

  render() {
    const {
      actionBarButtonText,
      breadCrumbPaths,
      pristine,
      close
    } = this.props;

    const sections = this.buildFormSections()
    return (
      <DisplayCreativeFormLayout
        actionBarButtonText={actionBarButtonText}
        close={close}
        breadCrumbPaths={breadCrumbPaths}
        leftFormSections={sections.leftPanel}
        rightFormSections={sections.rightPanel}
        pristine={pristine}
      />
    );
  }
}

export default compose<Props, DisplayCreativeFormProps>(
  reduxForm({
    form: DISPLAY_CREATIVE_FORM,
    enableReinitialize: true,
  }),
  injectIntl
)(DisplayCreativeForm);

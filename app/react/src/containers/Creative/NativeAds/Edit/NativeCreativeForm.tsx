import * as React from 'react';
import { reduxForm, InjectedFormProps, ConfigProps } from 'redux-form';
import { compose } from 'recompose';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';

import {
  DisplayCreativeFormData,
  DISPLAY_CREATIVE_FORM,
  isExistingCreative,
} from '../../DisplayAds/Edit/domain';
import messages from '../../DisplayAds/Edit/messages';
import { Path } from '../../../../components/ActionBar';
import CustomLoaderPlaceholder from '../../DisplayAds/Edit/CustomLoaders/CustomLoaderPlaceholder';
import {
  PropertiesFormSection,
  PreviewFormSection,
} from '../../DisplayAds/Edit/Sections';
import GeneralFormSection from './GeneralFormSection';
import { Omit } from '../../../../utils/Types';
import { McsFormSection } from '../../../../utils/FormHelper';
import DisplayCreativeFormLayout from '../../DisplayAds/Edit/DisplayCreativeFormLayout';


export interface NativeCreativeFormProps
  extends Omit<ConfigProps<DisplayCreativeFormData>, 'form'> {
  actionBarButtonText: FormattedMessage.MessageDescriptor;
  close: () => void;
  breadCrumbPaths: Path[];
  goToCreativeTypeSelection?: () => void;
}

type Props = NativeCreativeFormProps &
  InjectedFormProps<DisplayCreativeFormData, NativeCreativeFormProps> & InjectedIntlProps;

class NativeCreativeForm extends React.Component<Props> {
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
      leftFormSections.push({
        id: 'preview',
        title: messages.creativeSectionPreviewTitle,
        component: <PreviewFormSection />,
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
      handleSubmit,
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
        handleSubmit={handleSubmit}
      />
    );
  }
}

export default compose<Props, NativeCreativeFormProps>(
  reduxForm({
    form: DISPLAY_CREATIVE_FORM,
    enableReinitialize: true,
  }),
  injectIntl
)(NativeCreativeForm);

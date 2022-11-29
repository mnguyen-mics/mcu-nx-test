import { defineMessages } from 'react-intl';

export default defineMessages({
  breadcrumbTitle: {
    id: 'settings.compartments.form.settings',
    defaultMessage: 'Compartments',
  },
  sectionGeneralTitle: {
    id: 'settings.compartments.form.general.title',
    defaultMessage: 'General Information',
  },
  saveCompartment: {
    id: 'settings.compartments.form.saveCompartment',
    defaultMessage: 'Save Compartment',
  },
  sectionGeneralSubTitle: {
    id: 'settings.compartments.form.general.subtitle',
    defaultMessage: 'Give your compartment a name',
  },
  sectionGeneralNameLabel: {
    id: 'settings.compartments.form.general.name.label',
    defaultMessage: 'Name',
  },
  sectionGeneralNamePlaceholder: {
    id: 'settings.compartments.form.general.name.placeholder',
    defaultMessage: 'Compartment Name',
  },
  sectionGeneralNameTooltip: {
    id: 'settings.compartments.form.general.name.tooltip',
    defaultMessage: 'Give your Compartment a Name',
  },
  sectionGeneralTokenLabel: {
    id: 'settings.compartments.form.general.token.label',
    defaultMessage: 'Token',
  },
  sectionGeneralTokenPlaceholder: {
    id: 'settings.compartments.form.general.Token.placeholder',
    defaultMessage: 'Compartment Token',
  },
  sectionGeneralTokenTooltip: {
    id: 'settings.compartments.form.general.token.tooltip',
    defaultMessage: 'Give your Compartment a Token',
  },
  sectionProcessingActivitiesTitle: {
    id: 'settings.compartments.form.processingActivities.title',
    defaultMessage: 'Processing Activities',
  },
  warningOnTokenEdition: {
    id: 'settings.compartments.form.general.token.warning',
    defaultMessage:
      'Danger Zone: Editing this token may cause any web site data collection tag to fail if not updated properly. Please make sure you have updated all your tags before saving.',
  },
  sectionGeneralAdvancedTitle: {
    id: 'settings.compartments.form.general.advanced.title',
    defaultMessage: 'Advanced',
  },
  sectionGeneralDefaultLabel: {
    id: 'settings.compartments.form.general.default.label',
    defaultMessage: 'Default',
  },
  sectionGeneralDefaultTooltip: {
    id: 'settings.compartments.form.general.default.tooltip',
    defaultMessage:
      "If 'true', this compartment will become the default compartment of your datamart. The current default compartment of your datamart will become a non-default compartment.",
  },
  sectionDatamartTitle: {
    id: 'settings.compartments.form.datamart.title',
    defaultMessage: 'Datamart',
  },
  savingInProgress: {
    id: 'settings.compartments.form.savingInProgress',
    defaultMessage: 'Saving your Compartment',
  },
  processingsWarningModalContent: {
    id: 'settings.compartments.processings.warning.content',
    defaultMessage:
      'You are about to change the Processing Activities on behalf of which you are capturing personal data on this compartment. mediarithmics platform will now automatically drop new User Profiles if the User Choices do not allow their capture. Do you want to continue?',
  },
  processingsWarningModalOk: {
    id: 'settings.compartments.processings.warning.ok',
    defaultMessage: 'OK',
  },
  processingsWarningModalCancel: {
    id: 'settings.compartments.processings.warning.cancel',
    defaultMessage: 'Cancel',
  },
});

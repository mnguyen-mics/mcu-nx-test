import { defineMessages } from 'react-intl';

export default defineMessages({
  saveMobileApp: {
    id: 'settings.mobileapp.form.saveMobileApp',
    defaultMessage: 'Save Mobile Application',
  },
  sectionGeneralTitle: {
    id: 'settings.mobileapp.form.general.title',
    defaultMessage: 'General Information',
  },
  sectionProcessingActivitiesTitle: {
    id: 'settings.mobileapp.form.processingActivities.title',
    defaultMessage: 'Processing Activities',
  },
  sectionVisitAnalyzerTitle: {
    id: 'settings.mobileapp.form.visitAnalayzer.title',
    defaultMessage: 'Visit Analyzers',
  },
  sectionEventRulesTitle: {
    id: 'settings.mobileapp.form.section.eventRules.title',
    defaultMessage: 'Event Rules',
  },
  sectionGeneralSubTitle: {
    id: 'settings.mobileapp.form.general.subtitle',
    defaultMessage: 'Give your Mobile Application a name',
  },
  contentSectionGeneralNameLabel: {
    id: 'settings.mobileapp.form.general.label',
    defaultMessage: 'Name',
  },
  contentSectionGeneralNamePlaceholder: {
    id: 'settings.mobileapp.form.general.placeholder',
    defaultMessage: 'Mobile Application Name',
  },
  contentSectionGeneralNameTooltip: {
    id: 'settings.mobileapp.form.general.tooltip',
    defaultMessage: 'Give your Mobile Application a Name',
  },
  contentSectionGeneralTokenLabel: {
    id: 'settings.mobileapp.form.general.token.label',
    defaultMessage: 'Token',
  },
  contentSectionGeneralTokenPlaceholder: {
    id: 'settings.mobileapp.form.general.token.placeholder',
    defaultMessage: 'Mobile Application Token',
  },
  contentSectionGeneralTokenTooltip: {
    id: 'settings.mobileapp.form.general.token.tooltip',
    defaultMessage:
      'Give your Mobile Application a unique token to identify your app. This token can be comprised of characters as well as numbers',
  },

  errorFormMessage: {
    id: 'settings.mobileapp.form.errorMessage',
    defaultMessage: 'There is an error with the data you have inputed, please check',
  },
  savingInProgress: {
    id: 'settings.mobileapp.form.savingInProgress',
    defaultMessage: 'Saving your Mobile App',
  },
  createMobileApplicationTitle: {
    id: 'settings.mobileapp.form.create',
    defaultMessage: 'New Mobile Application',
  },
  editMobileApplicationTitle: {
    id: 'settings.mobileapp.form.edit',
    defaultMessage: 'Edit {name}',
  },
  breadcrumbTitle1: {
    id: 'settings.mobileapp.form.settings',
    defaultMessage: 'Mobile Applications',
  },
  warningOnTokenEdition: {
    id: 'settings.datamart.mobileapp.edit.warning.token.edition',
    defaultMessage:
      'Danger Zone: Editing this token may cause any mobile application data collection to fail if not updated properly. Please make sure you have updated your tag in all your mobile apps before saving.',
  },
  processingsWarningModalContent: {
    id: 'settings.mobileapp.processings.warning.content',
    defaultMessage:
      'You are about to change the Processing Activities on behalf of which you are capturing personal data on this channel. mediarithmics platform will now automatically drop new User Events if the User Choices do not allow their capture. Do you want to continue?',
  },
  processingsWarningModalOk: {
    id: 'settings.mobileapp.processings.warning.ok',
    defaultMessage: 'OK',
  },
  processingsWarningModalCancel: {
    id: 'settings.mobileapp.processings.warning.cancel',
    defaultMessage: 'Cancel',
  },
});

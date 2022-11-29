import { defineMessages } from 'react-intl';

export default defineMessages({
  contentSectionNameLabel: {
    id: 'settings.datamart.form.name.label',
    defaultMessage: 'Name',
  },
  contentSectionNamePlaceholder: {
    id: 'settings.datamart.form.name.placeholder',
    defaultMessage: 'Datamart Name',
  },
  contentSectionNameTooltip: {
    id: 'settings.datamart.form.name.tooltip',
    defaultMessage: 'Give your Datamart a name to identify it.',
  },
  sectionGeneralTitle: {
    id: 'settings.datamart.form.general.title',
    defaultMessage: 'General Information',
  },
  sectionGeneralSubTitle: {
    id: 'settings.datamart.form.general.subtitle',
    defaultMessage: "Modify your Datamart's information",
  },
  contentSectionGeneralTokenLabel: {
    id: 'settings.datamart.form.general.token.label',
    defaultMessage: 'Token',
  },
  contentSectionGeneralTokenPlaceholder: {
    id: 'settings.datamart.form.general.token.placeholder',
    defaultMessage: 'Datamart Token',
  },
  contentSectionGeneralTokenTooltip: {
    id: 'settings.datamart.form.general.token.tooltip',
    defaultMessage:
      'Give your Datamart a unique token to identify it. This token can be comprised of characters as well as numbers',
  },
  saveDatamart: {
    id: 'settings.datamart.form.saveMobileApp',
    defaultMessage: 'Save',
  },
  sectionEventRulesTitle: {
    id: 'settings.datamart.form.section.eventRules.title',
    defaultMessage: 'Event Rules',
  },
  errorFormMessage: {
    id: 'settings.datamart.form.errorMessage',
    defaultMessage: 'There is an error with the data you have inputed, please check',
  },
  savingInProgress: {
    id: 'settings.datamart.form.savingInProgress',
    defaultMessage: 'Saving your Datamart',
  },
  editDatamartTitle: {
    id: 'settings.datamart.form.edit',
    defaultMessage: 'Edit {name}',
  },
  createDatamartTitle: {
    id: 'settings.datamart.form.create',
    defaultMessage: 'New Datamart',
  },
  breadcrumbTitle1: {
    id: 'settings.datamart.form.settings',
    defaultMessage: 'Datamarts',
  },
  warningOnTokenEdition: {
    id: 'settings.datamart.edit.warning.token.edition',
    defaultMessage:
      'Danger Zone: Editing this token may cause any integrations to fail if not updated properly. Please make sure you have reviewed all your integration before saving.',
  },
});

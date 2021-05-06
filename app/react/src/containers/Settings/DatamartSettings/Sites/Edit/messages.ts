import { defineMessages } from 'react-intl';

export default defineMessages({
  errorFormMessage: {
    id: 'settings.site.form.errorMessage',
    defaultMessage: 'There is an error with the data you have inputed, please check',
  },
  savingInProgress: {
    id: 'settings.site.form.savingInProgress',
    defaultMessage: 'Saving your Site',
  },
  createSiteTitle: {
    id: 'settings.site.form.create',
    defaultMessage: 'New Site',
  },
  editSiteTitle: {
    id: 'settings.site.form.edit',
    defaultMessage: 'Edit {name}',
  },
  breadcrumbTitle1: {
    id: 'settings.site.form.settings',
    defaultMessage: 'Sites',
  },
  saveSite: {
    id: 'settings.site.form.save',
    defaultMessage: 'Save',
  },
  sectionGeneralTitle: {
    id: 'settings.site.form.section.general.title',
    defaultMessage: 'General Information',
  },
  sectionGeneralSubTitle: {
    id: 'settings.site.form.section.general.subtitle',
    defaultMessage: 'Please fill the basic information for your website so we can generate a Tag.',
  },
  sectionAliasesTitle: {
    id: 'settings.site.form.section.aliases.title',
    defaultMessage: 'Aliases',
  },
  sectionAliasesSubTitle: {
    id: 'settings.site.form.section.aliases.subtitle',
    defaultMessage:
      'An Alias is a domain or a subdomain different from your main domain on which your website is being served.',
  },
  sectionEventRulesTitle: {
    id: 'settings.site.form.section.eventRules.title',
    defaultMessage: 'Event Rules',
  },
  sectionVisitAnalyzer: {
    id: 'settings.site.form.section.visitAnalyzer.title',
    defaultMessage: 'Visit Analyzer',
  },
  sectionProcessingActivitiesTitle: {
    id: 'settings.site.form.section.processingActivities.title',
    defaultMessage: 'Processing Activities',
  },
  contentSectionGeneralNameLabel: {
    id: 'settings.site.form.general.label',
    defaultMessage: 'Name',
  },
  contentSectionGeneralNamePlaceholder: {
    id: 'settings.site.form.general.placeholder',
    defaultMessage: 'Site Name',
  },
  contentSectionGeneralNameTooltip: {
    id: 'settings.site.form.general.tooltip',
    defaultMessage: 'Give your Site a Name',
  },
  contentSectionGeneralTokenLabel: {
    id: 'settings.site.form.general.token.label',
    defaultMessage: 'Token',
  },
  contentSectionGeneralTokenPlaceholder: {
    id: 'settings.site.form.general.token.placeholder',
    defaultMessage: 'Site Token',
  },
  contentSectionGeneralTokenTooltip: {
    id: 'settings.site.form.general.token.tooltip',
    defaultMessage:
      'Give your Site a unique token to identify your app. This token can be comprised of characters as well as numbers',
  },
  contentSectionGeneralDomainLabel: {
    id: 'settings.site.form.general.domain.label',
    defaultMessage: 'Domain',
  },
  contentSectionGeneralDomainPlaceholder: {
    id: 'settings.site.form.general.domain.placeholder',
    defaultMessage: 'Site Domain',
  },
  contentSectionGeneralDomainTooltip: {
    id: 'settings.site.form.general.domain.tooltip',
    defaultMessage:
      "This is the main domain on which your website runs. Don't worry you can add several other later on!",
  },
  contentSectionAliasesNameLabel: {
    id: 'settings.site.form.Aliases.label',
    defaultMessage: 'Aliases',
  },
  contentSectionAliasesNamePlaceholder: {
    id: 'settings.site.form.Aliases.placeholder',
    defaultMessage: 'Add an alias and click on enter',
  },
  contentSectionGAliasesNameTooltip: {
    id: 'settings.site.form.Aliases.tooltip',
    defaultMessage: 'Type your alias name and then click on enter to validate.',
  },
  warningOnTokenEdition: {
    id: 'settings.site.warning.token.edition',
    defaultMessage:
      'Danger Zone: Editing this token may cause any web site data collection tag to fail if not updated properly. Please make sure you have updated all your tags before saving.',
  },
  processingsWarningModalContent: {
    id: 'settings.site.processings.warning.content',
    defaultMessage:
      'You are about to change the Processing Activities on behalf of which you are capturing personal data on this channel. mediarithmics platform will now automatically drop new User Events if the User Choices do not allow their capture. Do you want to continue?',
  },
  processingsWarningModalOk: {
    id: 'settings.site.processings.warning.ok',
    defaultMessage: 'OK',
  },
  processingsWarningModalCancel: {
    id: 'settings.site.processings.warning.cancel',
    defaultMessage: 'Cancel',
  },
});

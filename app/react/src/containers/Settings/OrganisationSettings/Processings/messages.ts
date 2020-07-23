import { defineMessages } from 'react-intl';

const messages = defineMessages({
  processingActivities: {
    id: 'settings.organisation.processings.processingActivities',
    defaultMessage: 'Processing Activities',
  },
  id: {
    id: 'settings.organisation.processings.list.id',
    defaultMessage: 'ID',
  },
  name: {
    id: 'settings.organisation.processings.list.name',
    defaultMessage: 'Name',
  },
  purpose: {
    id: 'settings.organisation.processings.list.purpose',
    defaultMessage: 'Purpose',
  },
  legalBasis: {
    id: 'settings.organisation.processings.list.legalBasis',
    defaultMessage: 'Legal basis',
  },
  technicalName: {
    id: 'settings.organisation.processings.list.technicalName',
    defaultMessage: 'Technical name',
  },
  token: {
    id: 'settings.organisation.processings.list.token',
    defaultMessage: 'Token',
  },
  emptyProcessings: {
    id: 'settings.organisation.processings.list.emptyProcessings',
    defaultMessage: 'There are no processings.',
  },
  editProcessing: {
    id: 'settings.organisation.processings.list.editProcessing',
    defaultMessage: 'Edit',
  },
  archiveProcessing: {
    id: 'settings.organisation.processings.list.archiveProcessing',
    defaultMessage: 'Archive',
  },
  deleteProcessing: {
    id: 'settings.organisation.processings.list.deleteProcessing',
    defaultMessage: 'Delete',
  },
  newProcessing: {
    id: 'settings.organisation.processings.list.newProcessing',
    defaultMessage: 'New Data Processing',
  },
  breadcrumbTitle: {
    id: 'settings.organisation.processings.form.settings',
    defaultMessage: 'Data Processings',
  },
  saveProcessing: {
    id: 'settings.organisation.processings.form.save',
    defaultMessage: 'Save',
  },
  legalBasisSectionTitle: {
    id: 'settings.organisation.processings.form.sections.legalBasis.title',
    defaultMessage: 'Legal Basis',
  },
  legalBasisSectionSubTitle: {
    id: 'settings.organisation.processings.form.sections.legalBasis.subtitle',
    defaultMessage: 'The legal basis of your processing activity',
  },
  legalBasisSectionLegalBasisLabel: {
    id: 'settings.organisation.processings.form.sections.legalBasis.label',
    defaultMessage: 'Legal basis',
  },
  legalBasisSectionLegalBasisTooltip: {
    id: 'settings.organisation.processings.form.sections.legalBasis.tooltip',
    defaultMessage: 'The lawful basis of the data processing (GDPR - Art. 6.1). Cannot be changed after the creation of the processing.',
  },
  generalSectionTitle: {
    id: 'settings.organisation.processings.form.sections.general.title',
    defaultMessage: 'General Information',
  },
  generalSectionSubTitle: {
    id: 'settings.organisation.processings.form.sections.general.subtitle',
    defaultMessage: 'Give your processing a name and a purpose.',
  },
  generalSectionNameLabel: {
    id: 'settings.organisation.processings.form.sections.general.name.label',
    defaultMessage: 'Name',
  },
  generalSectionNamePlaceholder: {
    id: 'settings.organisation.processings.form.sections.general.name.placeholder',
    defaultMessage: 'Data Processing Name',
  },
  generalSectionNameTooltip: {
    id: 'settings.organisation.processings.form.sections.general.name.tooltip',
    defaultMessage: 'Choose a short name to describe your processing. It will appear in dropdown lists to select a processing (audience segment creation, display campaign creation etc.), or when you read the user consents of a user.',
  },
  generalSectionPurposeLabel: {
    id: 'settings.organisation.processings.form.sections.general.purpose.label',
    defaultMessage: 'Purpose',
  },
  generalSectionPurposePlaceholder: {
    id: 'settings.organisation.processings.form.sections.general.purpose.placeholder',
    defaultMessage: 'Data Processing Purpose',
  },
  generalSectionPurposeTooltip: {
    id: 'settings.organisation.processings.form.sections.general.purpose.tooltip',
    defaultMessage: 'The purpose of the current personal data processing (GDPR - Article 5.1.b).',
  },
  generalSectionAdvancedPartTitle: {
    id: 'settings.organisation.processings.form.sections.general.advanced.title',
    defaultMessage: 'Advanced',
  },
  generalSectionTechnicalNameLabel: {
    id: 'settings.organisation.processings.form.sections.general.technicalName.label',
    defaultMessage: 'Technical Name',
  },
  generalSectionTechnicalNamePlaceholder: {
    id: 'settings.organisation.processings.form.sections.general.technicalName.placeholder',
    defaultMessage: 'Technical Name',
  },
  generalSectionTechnicalNameTooltip: {
    id: 'settings.organisation.processings.form.sections.general.technicalName.tooltip',
    defaultMessage: "The 'technical name' is an external key you can provide for a processing in order to retrieve it through API integrations.",
  },
  generalSectionTokenLabel: {
    id: 'settings.organisation.processings.form.sections.general.token.label',
    defaultMessage: 'Token',
  },
  generalSectionTokenPlaceholder: {
    id: 'settings.organisation.processings.form.sections.general.token.placeholder',
    defaultMessage: 'Token',
  },
  generalSectionTokenTooltip: {
    id: 'settings.organisation.processings.form.sections.general.token.tooltip',
    defaultMessage: "The 'token' is a random key you can use in non-authenticated integrations (such as javascript-based website tracking) to create user consents on a given user.",
  },
  warningOnTokenEdition: {
    id: 'settings.organisation.processings.form.sections.general.token.warning',
    defaultMessage: 'Danger Zone: Editing this token may cause any web site data collection tag to fail if not updated properly. Please make sure you have updated all your tags before saving.',
  },
  legalBasisTitle: {
    id: 'settings.organisation.processings.form.legalBasis.title',
    defaultMessage: 'Legal Basis',
  },
  legalBasisSubTitle: {
    id: 'settings.organisation.processings.form.legalBasis.subtitle',
    defaultMessage: 'Select the legal basis of your new Processing Activity. You will not be able to change it afterwards.',
  },
  consentSubTitle: {
    id: 'settings.organisation.processings.form.legalBasis.consent.subtitle',
    defaultMessage: 'The data subject has given consent to the processing of his or her personal data for one or more specific purposes',
  },
  contractualPerformanceSubTitle: {
    id: 'settings.organisation.processings.form.legalBasis.contractualPerformance.subtitle',
    defaultMessage: 'Processing is necessary for the performance of a contract to which the data subject is party or in order to take steps at the request of the data subject prior to entering into a contract',
  },
  legalObligationSubTitle: {
    id: 'settings.organisation.processings.form.legalBasis.legalObligation.subtitle',
    defaultMessage: 'Processing is necessary for compliance with a legal obligation to which the controller is subject',
  },
  publicInterestSubTitle: {
    id: 'settings.organisation.processings.form.legalBasis.publicInterest.subtitle',
    defaultMessage: 'Processing is necessary for the performance of a task carried out in the public interest or in the exercise of official authority vested in the controller',
  },
  legitimateInterestSubTitle: {
    id: 'settings.organisation.processings.form.legalBasis.legitimateInterest.subtitle',
    defaultMessage: 'Processing is necessary for the purposes of the legitimate interests pursued by the controller or by a third party, except where such interests are overriden by the interests or fundamental rights and freedoms of the data subject which require protection of personal data, in particular where the data subject is a child. Shall not apply to processing carried out by public authorities in the performance of their tasks.',
  },
  communityModalMessage: {
    id: 'settings.organisation.processings.list.modal.community',
    defaultMessage: 'Modification on Processings can only be done at community level. Please confirm to change the organisation you are browsing.'
  },
  deleteModalMessage: {
    id: 'settings.organisation.processings.list.modal.delete',
    defaultMessage: 'Please confirm the deletion of processing with id'
  }
});

export default messages;

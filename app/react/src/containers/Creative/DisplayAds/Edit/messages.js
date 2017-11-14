import { defineMessages } from 'react-intl';

export default defineMessages({
  saveCreative: {
    id: 'message.submit.saveCreative',
    defaultMessage: 'Save',
  },
  creativesTypePickerTitle: {
    id: 'creatives.create.typePicker.title',
    defaultMessage: 'Creative Type',
  },
  creativesTypePickerSubTitle: {
    id: 'creatives.create.typePicker.subtitle',
    defaultMessage: 'Choose your creative type',
  },
  creativeSectionGeneralTitle: {
    id: 'creatives.create.section.general.title',
    defaultMessage: 'General Information',
  },
  creativeSectionGeneralSubTitle: {
    id: 'creatives.create.section.general.subtitle',
    defaultMessage: 'Give your Creative a name, a format and a destination domain to make it usable.',
  },
  creativeSectionPropertyTitle: {
    id: 'creatives.create.section.properties.title',
    defaultMessage: 'Creative Properties',
  },
  creativeSectionPropertySubTitle: {
    id: 'creatives.create.section.properties.subtitle',
    defaultMessage: 'Fill the property of your creative to turn it real!',
  },
  creativeSectionAuditTitle: {
    id: 'creatives.create.section.audit.title',
    defaultMessage: 'Audit Information',
  },
  creativeSectionAuditSubTitle: {
    id: 'creatives.create.section.audit.subtitle',
    defaultMessage: 'If you want to advertise through adechanges you need to pass an audit first. Click on the start audit button to get started.',
  },
  creativeSectionPreviewTitle: {
    id: 'creatives.create.section.preview.title',
    defaultMessage: 'Preview',
  },
  creativeSectionPreviewSubTitle: {
    id: 'creatives.create.section.preview.subtitle',
    defaultMessage: 'This is how you creative will render on a publisher website. Please note that the tracker won\'t be visible here',
  },
  creativeCreationSaveButton: {
    id: 'creatives.create.actionbar.button.save',
    defaultMessage: 'Save',
  },
  creativeCreationBreadCrumb: {
    id: 'creatives.create.actionbar.breadcrumb.label',
    defaultMessage: 'New Display Creative',
  },
  creativeCreationGeneralNameFieldTitle: {
    id: 'creatives.create.section.general.field.name.title',
    defaultMessage: 'Creative Name',
  },
  creativeCreationGeneralNameFieldPlaceHolder: {
    id: 'creatives.create.section.general.field.name.placeholder',
    defaultMessage: 'Creative Name',
  },
  creativeCreationGeneralNameFieldHelper: {
    id: 'creatives.create.section.general.field.name.helper',
    defaultMessage: 'Give your Creative a name and make it as memorable as your Creative!',
  },
  creativeCreationGeneralFormatFieldTitle: {
    id: 'creatives.create.section.general.field.format.title',
    defaultMessage: 'Format',
  },
  creativeCreationGeneralFormatFieldPlaceHolder: {
    id: 'creatives.create.section.general.field.format.placeholder',
    defaultMessage: 'Creative Format',
  },
  creativeCreationGeneralFormatFieldHelper: {
    id: 'creatives.create.section.general.field.format.helper',
    defaultMessage: 'The format of the creative will be used in campaign by the platform. The format is as follow: width x height',
  },
  creativeCreationGeneralDomainFieldTitle: {
    id: 'creatives.create.section.general.field.domain.title',
    defaultMessage: 'Destination Domain',
  },
  creativeCreationGeneralDomainFieldPlaceHolder: {
    id: 'creatives.create.section.general.field.domain.placeholder',
    defaultMessage: 'Destination Domain',
  },
  creativeCreationGeneralDomainFieldHelper: {
    id: 'creatives.create.section.general.field.domain.helper',
    defaultMessage: 'This is the final redirect location domain (without http or params) eg: destination.mybrand.com',
  },
  creativeAuditStatusFailed: {
    id: 'creatives.audit.status.failed',
    defaultMessage: 'Audit Failed'
  },
  creativeAuditStatusPassed: {
    id: 'creatives.audit.status.passed',
    defaultMessage: 'Audit Success'
  },
  creativeAuditStatusPending: {
    id: 'creatives.audit.status.pending',
    defaultMessage: 'Audit Pending'
  },
  creativeAuditStatusPartiallyPassed: {
    id: 'creatives.audit.status.partiallypassed',
    defaultMessage: 'Audit Partially Passed'
  },
  creativeAuditStatusDetails: {
    id: 'creatives.audit.status.details.button',
    defaultMessage: 'Audit Details'
  },
  creativeAuditStatusStart: {
    id: 'creatives.audit.status.start.button',
    defaultMessage: 'Start Audit'
  },
  creativeAuditStatusReset: {
    id: 'creatives.audit.status.reset.button',
    defaultMessage: 'Reset Audit'
  },
  creativeAuditStatusNotAudited: {
    id: 'creatives.audit.status.botAudited',
    defaultMessage: 'Not Audited'
  },
  creativeAuditStatusConfirmTitle: {
    id: 'creatives.audit.status.modal.confirm.title',
    defaultMessage: 'Submit your Creative to Audit'
  },
  creativeAuditStatusConfirmDescription: {
    id: 'creatives.audit.status.modal.confirm.description',
    defaultMessage: 'You are about to submit your creative to an external audit. It can take approximatly between 24 to 48 hours. You won\'t be able to modify your creative during the audit process. Are you sure you want to proceed?'
  },
  creativeAuditStatusConfirmResetTitle: {
    id: 'creatives.audit.status.modal.reset.title',
    defaultMessage: 'Reset your Creative Audit Status?'
  },
  creativeAuditStatusConfirmResetDescription: {
    id: 'creatives.audit.status.modal.reset.description',
    defaultMessage: 'You are about to reset your creative audit status, which means that you will need to pass the audit again to use it in a campaign. Are you sure you want to proceed?'
  },
  creativeSiderMenuCreativeType: {
    id: 'creatives.sider.menu.creativeType',
    defaultMessage: 'Creative Type'
  },
  creativeSiderMenuGeneralInformation: {
    id: 'creatives.sider.menu.generalInformation',
    defaultMessage: 'General Information'
  },
  creativeSiderMenuProperties: {
    id: 'creatives.sider.menu.properties',
    defaultMessage: 'Properties'
  },
  creativeSiderMenuPreview: {
    id: 'creatives.sider.menu.preview',
    defaultMessage: 'Preview'
  },
  creativeSiderMenuAudit: {
    id: 'creatives.sider.menu.audit',
    defaultMessage: 'Audit Information'
  },
  creativeTypeQuantum: {
    id: 'creatives.type.quantum',
    defaultMessage: 'Quantum'
  },
  creativeTypeIvidence: {
    id: 'creatives.type.ividence',
    defaultMessage: 'Ividence'
  },
  creativeTypeAgency: {
    id: 'creatives.type.agency',
    defaultMessage: 'Agency Script'
  },
  creativeTypeImage: {
    id: 'creatives.type.image',
    defaultMessage: 'Image Creative'
  },
  creativeTypeHtml: {
    id: 'creatives.type.html',
    defaultMessage: 'Html Creative'
  },
  creativeTypeSkin: {
    id: 'creatives.type.skin',
    defaultMessage: 'Image Skins'
  },
  creativeTypeNative: {
    id: 'creatives.type.native',
    defaultMessage: 'Native'
  },
  creativeTypeOr: {
    id: 'creatives.type.or',
    defaultMessage: 'Or'
  },
  creativeTypeAdvanced: {
    id: 'creatives.type.advanced',
    defaultMessage: 'Advanced'
  },
});

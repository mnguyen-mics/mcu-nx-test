import { defineMessages } from 'react-intl';

export default defineMessages({
  saveCreative: {
    id: 'message.submit.saveCreative',
    defaultMessage: 'Save',
  },
  editCreatives: {
    id: 'message.edit.creatives',
    defaultMessage: 'Edit Creatives',
  },
  multiEditCreativesSubtitle: {
    id: 'message.edit.creatives.form.subtitle',
    defaultMessage: 'In this section you will be able to edit the creatives you just selected : ',
  },
  multiEditCreativesTitle: {
    id: 'message.edit.creatives.form.title',
    defaultMessage: 'Multi Creative Edit',
  },
  addCreative: {
    id: 'message.add.saveCreative',
    defaultMessage: 'Add',
  },
  updateCreative: {
    id: 'message.update.saveCreative',
    defaultMessage: 'Update',
  },
  creativesTypePickerTitle: {
    id: 'creatives.create.typePicker.title',
    defaultMessage: 'Creative Type',
  },
  creativesTypePickerSubTitle: {
    id: 'creatives.display.edit.typePicker.subtitle',
    defaultMessage: 'Choose your creative type',
  },
  creativeSectionGeneralTitle: {
    id: 'creatives.create.section.general.title',
    defaultMessage: 'General Information',
  },
  creativeSectionGeneralSubTitle: {
    id: 'creatives.create.section.general.subtitle',
    defaultMessage:
      'Give your Creative a name, a format and a destination domain to make it usable.',
  },
  creativeSectionGeneralMultipleSubTitle: {
    id: 'creatives.create.section.general.multiple.subtitle',
    defaultMessage:
      'Give your Creative a destination domain. You can change your creative name in the left panel.',
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
    defaultMessage:
      'If you want to advertise through adechanges you need to pass an audit first. Click on the start audit button to get started.',
  },
  creativeSectionPreviewTitle: {
    id: 'creatives.create.section.preview.title',
    defaultMessage: 'Preview',
  },
  creativeSectionPreviewSubTitle: {
    id: 'creatives.create.section.preview.subtitle',
    defaultMessage:
      "This is how you creative will render on a publisher website. Please note that the tracker won't be visible here",
  },
  creativeCreationSaveButton: {
    id: 'creatives.create.actionbar.button.saveRefresh',
    defaultMessage: 'Save & Refresh',
  },
  creativeCreationBreadCrumb: {
    id: 'creatives.create.actionbar.breadcrumb.label',
    defaultMessage: 'New Display Creative',
  },
  creativeEditionBreadCrumb: {
    id: 'creatives.edition.actionbar.breadcrumb.label',
    defaultMessage: 'Edit {name}',
  },
  displayListBreadCrumb: {
    id: 'display.creatives.list.actionbar.breadcrumb.label',
    defaultMessage: 'Display Ads',
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
  creativeCreationGeneralFormatFieldButtonCustom: {
    id: 'creatives.create.section.general.field.format.button.custom',
    defaultMessage: 'Custom',
  },
  creativeCreationGeneralFormatFieldButtonStandard: {
    id: 'creatives.create.section.general.field.format.button.standard',
    defaultMessage: 'Standard',
  },
  creativeCreationGeneralFormatFieldHelper: {
    id: 'creatives.create.section.general.field.format.helper',
    defaultMessage:
      'The format of the creative will be used in campaign by the platform. The format is as follow: width x height',
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
    defaultMessage:
      "This is the domain of the Advertiser (without http or params) eg: mybrand.com.\n It'll be checked during Creative Audit and for the creative whitelisting/blacklisting by Publishers on SSPs.",
  },
  creativeSiderMenuCreativeType: {
    id: 'creatives.sider.menu.creativeType',
    defaultMessage: 'Creative Type',
  },
  creativeSiderMenuGeneralInformation: {
    id: 'creatives.sider.menu.generalInformation',
    defaultMessage: 'General Information',
  },
  creativeSiderMenuProperties: {
    id: 'creatives.sider.menu.properties',
    defaultMessage: 'Properties',
  },
  creativeSiderMenuPreview: {
    id: 'creatives.sider.menu.preview',
    defaultMessage: 'Preview',
  },
  creativeSiderMenuAudit: {
    id: 'creatives.sider.menu.audit',
    defaultMessage: 'Audit Information',
  },
  creativeTypeQuantum: {
    id: 'creatives.type.quantum',
    defaultMessage: 'Quantum',
  },
  creativeTypeIvidence: {
    id: 'creatives.type.ividence',
    defaultMessage: 'Ividence',
  },
  creativeTypeAgency: {
    id: 'creatives.type.agency',
    defaultMessage: 'Agency Script',
  },
  creativeTypeImage: {
    id: 'creatives.type.image',
    defaultMessage: 'Banner',
  },
  creativeTypeHtml: {
    id: 'creatives.type.html',
    defaultMessage: 'Html',
  },
  creativeTypeSkin: {
    id: 'creatives.type.skin',
    defaultMessage: 'Skins',
  },
  allRendererList: {
    id: 'creatives.type.all.renderer.list',
    defaultMessage: 'All Ad Renderer',
  },
  allRendererListSubtitle: {
    id: 'creatives.type.all.renderer.list.subtitle',
    defaultMessage: 'List of all available ad renderer.',
  },
  creativeTypeOr: {
    id: 'creatives.type.or',
    defaultMessage: 'Or',
  },
  creativeTypeAdvanced: {
    id: 'creatives.type.advanced',
    defaultMessage: 'Advanced',
  },
  errorFormMessage: {
    id: 'creatives.display.edit.generic.errorMessage',
    defaultMessage:
      'There is an error with some fields in your form. Please review the data you entered.',
  },
  savingInProgress: {
    id: 'creatives.display.edit.savingInProgress',
    defaultMessage: 'Saving in progress',
  },
  advanced: {
    id: 'creatives.form.advanced',
    defaultMessage: 'Advanced',
  },
  creativeCreationAdvancedTechnicalFieldTitle: {
    id: 'creatives.create.section.advanced.field.technical.title',
    defaultMessage: 'Technical Name',
  },
  warningOnTokenEdition: {
    id: 'creative.form.edition.technicalName.warning',
    defaultMessage:
      'Danger Zone: Editing this technical name may cause any integrations to fail if not updated properly. Please make sure you have reviewed all your integration before saving.',
  },
  creativeCreationAdvancedTechnicalFieldPlaceholder: {
    id: 'creatives.create.section.advanced.field.technical.placeholder',
    defaultMessage: 'Technical Name',
  },
  creativeCreationAdvancedTechnicalFieldTooltip: {
    id: 'creatives.create.section.advanced.field.technical.tooltip',
    defaultMessage:
      'Give your creative a technical name to leverage integrations such as external click tracking.',
  },
  invalidFormat: {
    id: 'creatives.create.section.general.invalidFormat',
    defaultMessage: 'Invalid format.',
  },
  modalConfirmTitle: {
    id: 'creatives.create.modal.confirm.title',
    defaultMessage: 'Warning',
  },
  modalConfirmContent: {
    id: 'creatives.create.modal.confirm.content',
    defaultMessage: 'You have changes that are not saved. Do you want to proceed ?',
  },
  modalConfirmOk: {
    id: 'creatives.create.modal.confirm.Ok',
    defaultMessage: 'Close Without Saving',
  },
  modalConfirmCancel: {
    id: 'creatives.create.modal.confirm.cancel',
    defaultMessage: 'Cancel',
  },
  successfulSaving: {
    id: 'creatives.create.modal.save.successful',
    defaultMessage: 'Your Creative has been successfully saved!',
  },
});

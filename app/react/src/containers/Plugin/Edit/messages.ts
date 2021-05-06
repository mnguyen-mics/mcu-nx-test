import { defineMessages } from 'react-intl';

export default defineMessages({
  save: {
    id: 'plugin.edit.save',
    defaultMessage: 'Save',
  },
  menuGeneralInformation: {
    id: 'plugin.edit.general',
    defaultMessage: 'General Information',
  },
  menuType: {
    id: 'plugin.edit.type',
    defaultMessage: 'Type',
  },
  menuProperties: {
    id: 'plugin.edit.proerties',
    defaultMessage: 'Properties',
  },
  sectionGeneralTitle: {
    id: 'plugin.edit.section.general.title',
    defaultMessage: 'General Information',
  },
  sectionGeneralName: {
    id: 'plugin.edit.section.general.button.name',
    defaultMessage: 'Name',
  },
  sectionGeneralPlaceholder: {
    id: 'plugin.edit.section.general.button.placeholder',
    defaultMessage: 'Name',
  },
  sectionGeneralHelper: {
    id: 'plugin.edit.section.general.button.helper',
    defaultMessage:
      'Select a name and make it memorable so you can find it back across different screens.',
  },
  sectionPropertiesTitle: {
    id: 'plugin.edit.section.properties.title',
    defaultMessage: 'Properties',
  },
  sectionTechnicalName: {
    id: 'plugin.edit.section.technic.button.name',
    defaultMessage: 'Technical Name',
  },
  sectionTechnicalPlaceholder: {
    id: 'plugin.edit.section.technic.button.placeholder',
    defaultMessage: 'Technical Name',
  },
  sectionTechnicalHelper: {
    id: 'plugin.edit.section.technic.button.helper',
    defaultMessage:
      'Give your Email Template a technical name to leverage integrations such as external click tracking.',
  },
  advanced: {
    id: 'plugin.edit.advanced.button',
    defaultMessage: 'Advanced',
  },
  feedModalNameFieldLabel: {
    id: 'audience.segment.feed.create.nameField.label',
    defaultMessage: 'Name',
  },
  feedModalNameFieldTitle: {
    id: 'audience.segment.feed.create.nameField.title',
    defaultMessage: 'The name used to identify this feed.',
  },
  feedModalNameFieldTitleWarning: {
    id: 'audience.segment.feed.create.nameField.title.warning',
    defaultMessage:
      "Warning: This name is only used in the platform, it won't be visible on the external system.",
  },
  feedPresetModalNameFieldTitle: {
    id: 'audience.segment.feed.preset.create.nameField.title',
    defaultMessage:
      'The name that will be used to identify this feed preset and the feeds created with it.',
  },

  feedModalNameFieldPlaceholder: {
    id: 'audience.segment.feed.create.nameField.placeholder',
    defaultMessage: 'Name',
  },
  feedModalDescriptionFieldLabel: {
    id: 'audience.segment.feed.create.descriptionField.label',
    defaultMessage: 'Description',
  },
  feedModalDescriptionFieldTitle: {
    id: 'audience.segment.feed.create.descriptionField.title',
    defaultMessage:
      'A description of the feed preset to help understand what this preset is about.',
  },
  feedModalDescriptionFieldPlaceholder: {
    id: 'audience.segment.feed.create.descriptionField.placeholder',
    defaultMessage: 'Description',
  },
  presetDeletionModalDescription: {
    id: 'audience.segment.feed.preset.delete.modal.description',
    defaultMessage:
      "Are you sure you want to archive this feed preset? This will be permanent. The feeds already created with this feed preset won't be deleted.",
  },
  presetDeletionModalConfirm: {
    id: 'audience.segment.feed.preset.delete.modal.confirm',
    defaultMessage: 'Delete Now',
  },
  presetDeletionModalCancel: {
    id: 'audience.segment.feed.preset.delete.modal.cancel',
    defaultMessage: 'Cancel',
  },
});

import { defineMessages } from 'react-intl';

const messages = defineMessages({
  save: {
    id: 'automation.builder.node.FeedNodeForm.save.button',
    defaultMessage: 'Update',
  },
  sectionGeneralTitle: {
    id: 'automation.builder.node.FeedNodeForm.general.title',
    defaultMessage: 'General information',
  },
  nameFieldLabel: {
    id: 'automation.builder.node.FeedNodeForm.nameField.label',
    defaultMessage: 'Name',
  },
  nameFieldTitle: {
    id: 'automation.builder.node.FeedNodeForm.nameField.title',
    defaultMessage: 'The name that will be used to identify this feed preset and the feeds created with it.',
  },
  nameFieldPlaceholder: {
    id: 'automation.builder.node.FeedNodeForm.nameField.placeholder',
    defaultMessage: 'Name',
  },
  descriptionFieldLabel: {
    id: 'automation.builder.node.FeedNodeForm.descriptionField.label',
    defaultMessage: 'Description',
  },
  descriptionFieldTitle: {
    id: 'automation.builder.node.FeedNodeForm.descriptionField.title',
    defaultMessage: 'A description of the feed preset to help understand what this preset is about.',
  },
  descriptionFieldPlaceholder: {
    id: 'automation.builder.node.FeedNodeForm.descriptionField.placeholder',
    defaultMessage: 'Description',
  },
  nameFieldTitleWarning: {
    id: 'automation.builder.node.FeedNodeForm.nameField.title.warning',
    defaultMessage: "Warning: This name is only used in the platform, it won't be visible on the external system.",
  },
});

export default messages;

import { defineMessages } from 'react-intl';

const messages = defineMessages({
  save: {
    id: 'automation.builder.node.customActionForm.save.button',
    defaultMessage: 'Update',
  },
  sectionGeneralTitle: {
    id: 'automation.builder.node.customActionForm.general.title',
    defaultMessage: 'Description',
  },
  sectionGeneralSubtitle: {
    id: 'automation.builder.node.customActionForm.general.subtitle',
    defaultMessage: 'This action allows you to trigger a custom action.',
  },
  sectionGeneralConfigurationTitle: {
    id:
      'automation.builder.node.customActionForm.generalInfoSection.configuration.title',
    defaultMessage: 'Configuration',
  },
  customActionNameTitle: {
    id: 'automation.builder.node.customActionForm.name.title',
    defaultMessage: 'Name',
  },
  customActionNamePlaceholder: {
    id: 'automation.builder.node.customActionForm.name.placeholder',
    defaultMessage: 'Name',
  },
  pluginInstanceLabel: {
    id: 'automation.builder.node.customActionForm.pluginInstance.label',
    defaultMessage: 'Action name',
  },
  pluginInstanceTooltip: {
    id: 'automation.builder.node.customActionForm.pluginInstance.tooltip',
    defaultMessage:
      'Choose a custom action. You can check how to create custom action plugins in our',
  },
  developerDocumentation: {
    id: 'automation.builder.node.customActionForm.pluginInstance.developerDocumentation',
    defaultMessage:
      'developer documentation',
  },
  sectionPluginSettingsTitle: {
    id: 'automation.builder.node.customActionForm.pluginSettings.title',
    defaultMessage: 'Settings',
  },
  sectionPluginSettingsSubtitleFirstPart: {
    id: 'automation.builder.node.customActionForm.pluginSettings.subtitle.firstPart',
    defaultMessage:
      'The following properties are attached to your custom action. Check our',
  },
  sectionPluginSettingsSubtitleSecondPart: {
    id: 'automation.builder.node.customActionForm.pluginSettings.subtitle.secondPart',
    defaultMessage:
      'to see how to change their values.',
  },
  noInformationOnPlugin: {
    id:
      'automation.builder.node.customActionForm.pluginSettings.noInformationOnPlugin',
    defaultMessage: 'No information was found on this plugin',
  },
});

export default messages;

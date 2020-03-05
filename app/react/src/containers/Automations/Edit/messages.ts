import { defineMessages } from 'react-intl';

export default defineMessages({
  sectionTitle1: {
    id: 'automation.edit.section1.title',
    defaultMessage: 'Automation',
  },
  automationBuilder: {
    id: 'automation.edit.page.actionbar.title',
    defaultMessage: 'Automation Builder',
  },
  breadcrumbTitle: {
    id: 'automation.edit.breadcrumb.title',
    defaultMessage: 'Automations',
  },
  breadcrumbNew: {
    id: 'automation.edit.breadcrumb.new',
    defaultMessage: 'New Automation',
  },
  breadcrumbEdit: {
    id: 'automation.edit.breadcrumb.edit',
    defaultMessage: 'Edit { name }',
  },
  saveAutomation: {
    id: 'automation.edit.save',
    defaultMessage: 'Save',
  },
  errorFormMessage: {
    id: 'automation.edit.error',
    defaultMessage:
      'There was an error saving your scenario, please check the data you have inputed',
  },
  sectionGeneralTitle: {
    id: 'automation.edit.section.general.title',
    defaultMessage: 'General Information',
  },
  sectionGeneralSubTitle: {
    id: 'automation.edit.section.general.subtitle',
    defaultMessage: 'Give your Automation a name and make it memorable',
  },
  contentSectionGeneralLabel: {
    id: 'automation.edit.section.general.label',
    defaultMessage: 'Name',
  },
  contentSectionGeneralPlaceholder: {
    id: 'automation.edit.section.general.placeholder',
    defaultMessage: 'Automation Name',
  },
  contentSectionGeneralTooltip: {
    id: 'automation.edit.section.general.tooltip',
    defaultMessage: 'Give your Automation a Name and make it memorable!',
  },
  contentSectionGeneralAdvancedPartTitle: {
    id: 'automation.edit.section.general.advanced.title',
    defaultMessage: 'Advanced',
  },
  contentSectionGeneralAdvancedPartLabel: {
    id: 'automation.edit.section.general.advanced.label',
    defaultMessage: 'Technical Name',
  },
  contentSectionGeneralAdvancedPartPlaceholder: {
    id: 'automation.edit.section.general.advanced.placeholder',
    defaultMessage: 'Technical Name',
  },
  contentSectionGeneralAdvancedPartTooltip: {
    id: 'automation.edit.section.general.advanced.tooltip',
    defaultMessage: 'Use the technical name for third party integrations.',
  },
  sectionAutomationPreviewTitle: {
    id: 'automation.edit.section.automation.title',
    defaultMessage: 'Automation',
  },
  sectionAutomationPreviewSubTitle: {
    id: 'automation.edit.section.automation.subtitle',
    defaultMessage: 'Build your automation',
  },
  dontExist: {
    id: 'automation.edit.dontexist',
    defaultMessage: 'The automation you are trying to load doesn\'t seem to exist or you don\'t have the right to view it'
  },
  noMoreSupported: {
    id: 'automation.edit.section.legacyComponent.noMoreSupported',
    defaultMessage:
      'The query language related to this datamart is no more supported. Please select another datamart or create a new resource based on another datamart.',
  },
});

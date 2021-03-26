import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  // AUDIENCE BUILDER

  audienceBuilderNew: {
    id: 'settings.datamart.audienceBuilder.newAudienceBuilder',
    defaultMessage: 'New Segment Builder',
  },
  audienceBuilders: {
    id: 'settings.datamart.audienceBuilders',
    defaultMessage: 'Segment Builders',
  },
  audienceBuilderName: {
    id: 'settings.datamart.audienceBuilders.name',
    defaultMessage: 'Name',
  },
  audienceBuilderEdit: {
    id: 'settings.datamart.audienceBuilders.edit',
    defaultMessage: 'Edit',
  },
  audienceBuilderSave: {
    id: 'settings.datamart.audienceBuilders.save',
    defaultMessage: 'Save',
  },
  audienceBuilderDelete: {
    id: 'settings.datamart.audienceBuilders.delete',
    defaultMessage: 'Delete',
  },
  audienceBuilderEmptyList: {
    id: 'settings.datamart.audienceBuilders.emptyList',
    defaultMessage: 'There are no segment builders',
  },
  audienceBuilderSectionGeneralSubtitle: {
    id: 'settings.datamart.audienceBuilders.edit.subtitle',
    defaultMessage: 'Enter your parameters for the following inputs',
  },
  audienceBuilderSectionGeneralTitle: {
    id: 'settings.datamart.audienceBuilders.edit.general.title',
    defaultMessage: 'General Information',
  },
  audienceBuilderSectionDemographicsTitle: {
    id: 'settings.datamart.audienceBuilders.edit.demographics.title',
    defaultMessage: 'Demographics',
  },
  audienceBuilderSectionDemographicsSubtitle: {
    id: 'settings.datamart.audienceBuilders.edit.demographics.subtitle',
    defaultMessage:
      'Audience Features that will always be used when building an audience',
  },
  audienceBuilderSectionDemographicsAddButton: {
    id: 'settings.datamart.audienceBuilders.edit.demographics.add',
    defaultMessage: 'Add from library',
  },
  audienceBuilderNameLabel: {
    id: 'settings.datamart.audienceBuilders.edit.name.label',
    defaultMessage: 'Name',
  },
  audienceBuilderNamePlaceholder: {
    id: 'settings.datamart.audienceBuilders.edit.name.placeholder',
    defaultMessage: 'Name',
  },
  audienceBuilderNameTooltip: {
    id: 'settings.datamart.audienceBuilders.edit.name.tooltip',
    defaultMessage: 'Enter a name for your audience builder',
  },
  audienceBuilderPreview: {
    id: 'settings.datamart.audienceBuilders.edit.preview',
    defaultMessage: 'Preview',
  },
  audienceBuilderSavingInProgress: {
    id: 'settings.datamart.audienceBuilders.edit.savingInProgress',
    defaultMessage: 'Saving in progress...',
  },
  audienceBuilderDeleteListModalTitle: {
    id: 'settings.datamart.audienceBuilders.list.deleteModal.title',
    defaultMessage:
      'You are about to delete an Audience Builder from your datamart. This action cannot be undone. Do you want to proceed anyway ?',
  },
  audienceBuilderDeleteListModalOk: {
    id: 'settings.datamart.audienceBuilders.list.deleteModal.ok',
    defaultMessage: 'Delete',
  },
  audienceBuilderDeleteListModalCancel: {
    id: 'settings.datamart.audienceBuilders.list.deleteModal.cancel',
    defaultMessage: 'Cancel',
  },

  // AUDIENCE FEATURE

  audienceFeatureNew: {
    id: 'settings.datamart.audienceFeature.newAudienceFeature',
    defaultMessage: 'New Audience Feature',
  },
  audienceFeatureAddFolder: {
    id: 'settings.datamart.audienceFeature.addFolder',
    defaultMessage: 'Add Folder',
  },
  audienceFeaturePlaceholderFolderInput: {
    id: 'settings.datamart.audienceFeature.placeholderFolderInput',
    defaultMessage: 'Enter folder name',
  },
  audienceFeatureAddButton: {
    id: 'settings.datamart.audienceFeature.add',
    defaultMessage: 'Add',
  },
  audienceFeatureCancelButton: {
    id: 'settings.datamart.audienceFeature.cancel',
    defaultMessage: 'Cancel',
  },
  audienceFeatureRename: {
    id: 'settings.datamart.audienceFeature.renameFolder',
    defaultMessage: 'Rename',
  },
  audienceFeatures: {
    id: 'settings.datamart.audienceFeatures',
    defaultMessage: 'Audience Features',
  },
  audienceFeatureName: {
    id: 'settings.datamart.audienceFeatures.name',
    defaultMessage: 'Name',
  },
  audienceFeatureDescription: {
    id: 'settings.datamart.audienceFeatures.description',
    defaultMessage: 'Description',
  },
  audienceFeatureObjectTreeExpression: {
    id: 'settings.datamart.audienceFeatures.objectTreeExpression',
    defaultMessage: 'Object Tree Expression',
  },
  audienceFeatureEdit: {
    id: 'settings.datamart.audienceFeatures.edit',
    defaultMessage: 'Edit',
  },
  audienceFeatureSave: {
    id: 'settings.datamart.audienceFeatures.save',
    defaultMessage: 'Save',
  },
  audienceFeatureDelete: {
    id: 'settings.datamart.audienceFeatures.delete',
    defaultMessage: 'Delete',
  },
  audienceFeatureSearchPlaceholder: {
    id: 'settings.datamart.audienceFeatures.searchPlaceholder',
    defaultMessage: 'Search audience features',
  },
  audienceFeatureEmptyList: {
    id: 'settings.datamart.audienceFeatures.emptyList',
    defaultMessage: 'There are no audience features',
  },
  audienceFeatureSectionGeneralSubTitle: {
    id: 'settings.datamart.audienceFeatures.edit.subtitle',
    defaultMessage: 'Enter your parameters for the following inputs',
  },
  audienceFeatureSectionGeneralTitle: {
    id: 'settings.datamart.audienceFeatures.edit.title',
    defaultMessage: 'General Information',
  },
  audienceFeatureNameLabel: {
    id: 'settings.datamart.audienceFeatures.edit.name.label',
    defaultMessage: 'Name',
  },
  audienceFeatureNamePlaceholder: {
    id: 'settings.datamart.audienceFeatures.edit.name.placeholder',
    defaultMessage: 'Name',
  },
  audienceFeatureNameTooltip: {
    id: 'settings.datamart.audienceFeatures.edit.name.tooltip',
    defaultMessage: 'Enter a name for your audience feature',
  },
  audienceFeatureDescriptionLabel: {
    id: 'settings.datamart.audienceFeatures.edit.description.label',
    defaultMessage: 'Description',
  },
  audienceFeatureDescriptionPlaceholder: {
    id: 'settings.datamart.audienceFeatures.edit.description.placeholder',
    defaultMessage: 'Description',
  },
  audienceFeatureDescriptionTooltip: {
    id: 'settings.datamart.audienceFeatures.edit.description.tooltip',
    defaultMessage: 'Enter a description for your audience feature',
  },
  audienceFeatureAssociatedQuery: {
    id: 'settings.datamart.audienceFeatures.edit.query.title',
    defaultMessage: 'Associated Query',
  },
  audienceFeatureAssociatedQuerySubtitle: {
    id: 'settings.datamart.audienceFeatures.edit.query.subtitle',
    defaultMessage: 'Click on the button to edit your associated query',
  },
  audienceFeaturePreview: {
    id: 'settings.datamart.audienceFeatures.edit.preview',
    defaultMessage: 'Preview',
  },
  audienceFeatureSavingInProgress: {
    id: 'settings.datamart.audienceFeatures.edit.savingInProgress',
    defaultMessage: 'Saving in progress...',
  },
  audienceFeatureDeleteListModalTitle: {
    id: 'settings.datamart.audienceFeatures.list.deleteModal.title',
    defaultMessage:
      'You are about to delete an Audience Feature from your datamart. This action cannot be undone. Do you want to proceed anyway ?',
  },
  audienceFeatureDeleteListModalOk: {
    id: 'settings.datamart.audienceFeatures.list.deleteModal.ok',
    defaultMessage: 'Delete',
  },
  audienceFeatureDeleteListModalCancel: {
    id: 'settings.datamart.audienceFeatures.list.deleteModal.cancel',
    defaultMessage: 'Cancel',
  },
});

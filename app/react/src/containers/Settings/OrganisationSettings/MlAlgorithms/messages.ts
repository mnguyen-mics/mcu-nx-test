import { defineMessages } from 'react-intl';

const messages = defineMessages({
  id: {
    id: 'settings.organisation.ml-algorithms.id',
    defaultMessage: 'Id',
  },
  name: {
    id: 'settings.organisation.ml-algorithms.name',
    defaultMessage: 'Name',
  },
  description: {
    id: 'settings.organisation.ml-algorithms.description',
    defaultMessage: 'Description',
  },
  lastUpdatedDate: {
    id: 'settings.organisation.ml-algorithms.last-updated-date',
    defaultMessage: 'Last Updated Date',
  },
  emptyMlAlgorithms: {
    id: 'settings.organisation.ml-algorithms.empty-ml-algorithms',
    defaultMessage: 'No ML Algorithms for organisation',
  },
  mlAlgorithms: {
    id: 'settings.organisation.ml-algorithms.placeholder',
    defaultMessage: 'ML Algorithms'
  },
  downloadNotebook: {
    id: 'settings.organisation.ml-algorithms.download-notebook',
    defaultMessage: 'Download Notebook'
  },
  archive: {
    id: 'settings.organisation.ml-algorithms.archive',
    defaultMessage: 'Archive'
  },
  archived: {
    id: 'settings.organisation.ml-algorithms.archived',
    defaultMessage: 'Archived'
  },
  isArchived: {
    id: 'settings.organisation.ml-algorithms.is-archived',
    defaultMessage: 'Yes'
  },
  notArchived: {
    id: 'settings.organisation.ml-algorithms.not-archived',
    defaultMessage: 'No'
  },
  newMlAlgorithm: {
    id: 'settings.organisation.ml-algorithms.new',
    defaultMessage: 'New ML Algorithm'
  },
  empty: {
    id: 'settings.organisation.ml-algorithms.empty',
    defaultMessage: 'No Ml Algorithms'
  },
  editMlAlgorithmRaw: {
    id: 'settings.organisation.ml-algorithms.edit-raw',
    defaultMessage: 'Edit'
  },
  editMlAlgorithm: {
    id: 'settings.organisation.ml-algorithms.edit',
    defaultMessage: 'Edit {name}'
  },
  sectionTitleGeneral: {
    id: 'settings.organisation.ml-algorithms.edit.general-section',
    defaultMessage: 'General Informations'
  },
  sectionSubTitleGeneral: {
    id: 'settings.organisation.ml-algorithms.edit.subtitle',
    defaultMessage: 'Give your Ml Algorithm a name'
  },
  saveMlAlgorithm: {
    id: 'settings.organisation.ml-algorithms.edit.save',
    defaultMessage: 'Save'
  },
  labelMlAlgorithmName: {
    id: 'settings.organisation.ml-algorithms.edit.label.name',
    defaultMessage: 'ML Algorithm Name',
  },
  labelMlAlgorithmDescription: {
    id: 'settings.organisation.ml-algorithms.edit.label.description',
    defaultMessage: 'ML Algorithm Description',
  },
  tooltipMlAlgorithmName: {
    id: 'settings.organisation.ml-algorithms.edit.label.name.tooltip',
    defaultMessage:
      'Give your ML Algorithm a name so you can find it back in the different screens.',
  },
  savingInProgress: {
    id: 'settings.organisation.ml-algorithms.edit.savingInProgress',
    defaultMessage: 'Saving in progress',
  },
  updateSuccess: {
    id: 'settings.organisation.ml-algorithms.edit.save.successMessage',
    defaultMessage: 'ML Algorithm successfully saved ',
  },
  updateError: {
    id: 'settings.organisation.ml-algorithms.edit.list.errorMessage',
    defaultMessage: 'ML Algorithm update failed ',
  },
});

export default messages;

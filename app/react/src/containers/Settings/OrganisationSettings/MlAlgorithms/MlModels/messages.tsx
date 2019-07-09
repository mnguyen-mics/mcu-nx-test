import { defineMessages } from 'react-intl';

const messages = defineMessages({
  id: {
    id: 'settings.organisation.ml-models.id',
    defaultMessage: 'Id',
  },
  name: {
    id: 'settings.organisation.ml-models.name',
    defaultMessage: 'Name',
  },
  description: {
    id: 'settings.organisation.ml-models.description',
    defaultMessage: 'Description',
  },
  lastUpdatedDate: {
    id: 'settings.organisation.ml-models.last-updated-date',
    defaultMessage: 'Last Updated Date',
  },
  status: {
    id: 'settings.organisation.ml-models.status',
    defaultMessage: 'Status',
  },
  statusPaused: {
    id: 'settings.organisation.ml-models.status-paused',
    defaultMessage: 'Paused',
  },
  statusLive: {
    id: 'settings.organisation.ml-models.status-live',
    defaultMessage: 'Live',
  },
  empty: {
    id: 'settings.organisation.ml-models.empty',
    defaultMessage: 'No ML Models'
  },
  newMlModel: {
    id: 'settings.organisation.ml-models.new',
    defaultMessage: 'New ML Model'
  },
  mlModels: {
    id: 'settings.organisation.ml-models.placeholder',
    defaultMessage: 'ML Models'
  },
  uploadTitle: {
    id: 'settings.organisation.ml-models.upload.title',
    defaultMessage: 'Create your ML Model'
  },
  uploadConfirm: {
    id: 'settings.organisation.ml-models.upload.confirm',
    defaultMessage: 'Create ML Model'
  },
  uploadMessageNotebook: {
    id: 'settings.organisation.ml-models.upload.message-notebook',
    defaultMessage: 'Put your notebook here'
  },
  uploadMessageResult: {
    id: 'settings.organisation.ml-models.upload.message-result',
    defaultMessage: 'Put the notebook result as html here'
  },
  uploadMessageModel: {
    id: 'settings.organisation.ml-models.upload.message-model',
    defaultMessage: 'Put your model here'
  },
  namePlaceholder: {
    id: 'settings.organisation.ml-models.upload.name.placeholder',
    defaultMessage: 'Name Placeholder'
  },
  nameTooltip: {
    id: 'settings.organisation.ml-models.upload.name.tooltip',
    defaultMessage: 'Name tooltip'
  },
  modelCreationError: {
      id: 'settings.organisation.ml-models.create.error',
      defaultMessage: 'Error while creating the model'
  },
  downloadModel: {
    id: 'settings.organisation.ml-models.download.model',
    defaultMessage: 'Download Model'
  },
  downloadResult: {
    id: 'settings.organisation.ml-models.download.result',
    defaultMessage: 'Download Result'
  },
  downloadNotebook: {
    id: 'settings.organisation.ml-models.download.notebook',
    defaultMessage: 'Download Notebook'
  },
  previewResult: {
    id: 'settings.organisation.ml-models.download.preview-result',
    defaultMessage: 'Preview Result'
  },
  updateSuccess: {
    id: 'settings.organisation.ml-models.edit.save.successMessage',
    defaultMessage: 'ML Model successfully saved ',
  },
  updateError: {
    id: 'settings.organisation.ml-models.edit.list.errorMessage',
    defaultMessage: 'ML Model update failed ',
  },
  modelsLoadingError: {
    id: 'settings.organisation.ml-models.edit.list.errorLoadingMessage',
    defaultMessage: 'ML Models loading failed ',
  },
});

export default messages;

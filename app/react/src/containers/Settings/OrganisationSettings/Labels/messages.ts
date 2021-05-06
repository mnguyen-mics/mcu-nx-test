import { defineMessages } from 'react-intl';

const messages = defineMessages({
  searchPlaceholder: {
    id: 'settings.organisation.labels.search.placeholder',
    defaultMessage: 'Search Labels',
  },
  labelsName: {
    id: 'settings.organisation.labels.name',
    defaultMessage: 'Name',
  },
  labelsCreationDate: {
    id: 'settings.organisation.labels.creation_date',
    defaultMessage: 'Creation Date',
  },
  newLabel: {
    id: 'settings.organisation.labels.new',
    defaultMessage: 'New Label',
  },
  editLabel: {
    id: 'settings.organisation.labels.edit',
    defaultMessage: 'Edit',
  },
  archiveLabel: {
    id: 'settings.organisation.labels.archive',
    defaultMessage: 'Archive',
  },
  emptyLabels: {
    id: 'settings.organisation.labels.empty',
    defaultMessage: "There are no Labels set up. Click on 'New Label' to create one.",
  },
  labelAlreadyExists: {
    id: 'settings.organisation.label.already_exists',
    defaultMessage:
      "This Label name is already taken and a Label's name must be unique, please select another one.",
  },
  saveLabel: {
    id: 'settings.organisation.label.saveLabel',
    defaultMessage: 'Save',
  },
  cancelLabel: {
    id: 'settings.organisation.label.cancelLabel',
    defaultMessage: 'Cancel',
  },
  addNewLabelTitle: {
    id: 'settings.organisation.label.modal.creation.title',
    defaultMessage: 'Add New Label',
  },
  editLabelTitle: {
    id: 'settings.organisation.label.modal.edition.title',
    defaultMessage: 'Edit Label',
  },
  archiveModalTitle: {
    id: 'settings.organisation.labels.archiveModal.title',
    defaultMessage: 'Do you want to delete this item ?',
  },
});

export default messages;

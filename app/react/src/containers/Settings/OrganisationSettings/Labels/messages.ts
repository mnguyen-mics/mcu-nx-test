import { defineMessages } from 'react-intl';

const messages = defineMessages({
  searchPlaceholder: {
    id: 'labels.search.placeholder',
    defaultMessage: 'Search Labels',
  },
  labelsName: {
    id: 'labels.name',
    defaultMessage: 'Name',
  },
  labelsCreationDate: {
    id: 'labels.creation_date',
    defaultMessage: 'Creation Date',
  },
  newLabel: {
    id: 'labels.new',
    defaultMessage: 'New Label',
  },
  editLabel: {
    id: 'labels.edit',
    defaultMessage: 'Edit',
  },
  archiveLabel: {
    id: 'labels.archive',
    defaultMessage: 'Archive',
  },
  emptyLabels: {
    id: 'labels.empty',
    defaultMessage: 'There are no Labels set up. Click on \'New Label\' to create one.',
  },
  labelAlreadyExists: {
    id: 'label.already_exists',
    defaultMessage: 'This Label name is already taken and a Label\'s name must be unique, please select another one.',
  },
  saveLabel: {
    id: 'label.saveLabel',
    defaultMessage: 'Save',
  },
  cancelLabel: {
    id: 'label.cancelLabel',
    defaultMessage: 'Cancel',
  },
  addNewLabelTitle: {
    id: 'label.modal.creation.title',
    defaultMessage: 'Add New Label',
  },
  editLabelTitle: {
    id: 'label.modal.edition.title',
    defaultMessage: 'Edit Label',
  },
});

export default messages;

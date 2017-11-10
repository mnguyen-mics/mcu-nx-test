import { defineMessages } from 'react-intl';

const messages = defineMessages({
  searchPlaceholder: {
    id: 'labels.search.placeholder',
    defaultMessage: 'Search Sites',
  },
  labelsName: {
    id: 'labels.name',
    defaultMessage: 'Name',
  },
  labelsToken: {
    id: 'labels.token',
    defaultMessage: 'Token',
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
    defaultMessage: "There are no labels set up. Click on 'New Label' to create one.",
  },
});

export default messages;

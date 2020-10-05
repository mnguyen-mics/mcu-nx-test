import { defineMessages, FormattedMessage } from 'react-intl';

export const messages: {
  [key: string]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  labelFilterBy: {
    id: 'goal.filterby.label',
    defaultMessage: 'Filter By Label',
  },
  archiveGoalModalTitle: {
    id: 'goals.table.archive.modal.title',
    defaultMessage: 'Are you sure you want to archive this goal?',
  },
  archiveGoalModalBody: {
    id: 'goals.table.archive.modal.message',
    defaultMessage: "You'll not be able to recover it.",
  },
  archiveGoalModalOk: {
    id: 'goals.table.archive.modal.ok',
    defaultMessage: 'Archive Now',
  },
  archiveGoalModalCancel: {
    id: 'goals.table.archive.modal.cancel',
    defaultMessage: 'Cancel',
  },
  searchBarPlaceholder: {
    id: 'goals.table.searchbar.placeholder',
    defaultMessage: 'Search Goals',
  },
  archiveGoalActionButton: {
    id: 'goals.table.archive.action.button',
    defaultMessage: 'Archive',
  },
  ACTIVE: {
    id: 'goals.table.status.active',
    defaultMessage: 'Active',
  },
  PAUSED: {
    id: 'goals.table.status.paused',
    defaultMessage: 'Paused',
  },
  status: {
    id: 'goals.table.column.status',
    defaultMessage: 'Status',
  },
  name: {
    id: 'goals.table.column.name',
    defaultMessage: 'Name',
  },
  conversions: {
    id: 'goals.table.column.conversions',
    defaultMessage: 'Conversions',
  },
  conversionValue: {
    id: 'goals.table.column.conversionValue',
    defaultMessage: 'Conversion value',
  },
  edit: {
    id: 'goals.table.column.action.edit',
    defaultMessage: 'Edit',
  },
  noGoal: {
    id: 'goals.table.noGoal',
    defaultMessage: 'No goals',
  },
});

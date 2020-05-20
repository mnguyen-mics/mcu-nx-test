import { defineMessages } from 'react-intl';

export default defineMessages({
  status: {
    id: 'settings.cleaningRules.table.column.status',
    defaultMessage: 'Status',
  },
  action: {
    id: 'settings.cleaningRules.table.column.action',
    defaultMessage: 'Action',
  },
  lifeDuration: {
    id: 'settings.cleaningRules.table.column.life_duration',
    defaultMessage: 'Life duration',
  },
  channelFilter: {
    id: 'settings.cleaningRules.table.column.channel_filter',
    defaultMessage: 'Channel Filter',
  },
  activityTypeFilter: {
    id: 'settings.cleaningRules.table.column.activity_type_filter',
    defaultMessage: 'Activity type filter',
  },
  contentFilterValue: {
    id: 'settings.cleaningRules.table.column.content_filter.filter',
    defaultMessage: 'Event name filter',
  },
  updateStatus: {
    id: 'settings.cleaningRules.table.column.update_status',
    defaultMessage: 'Update status',
  },
  all: {
    id: 'settings.cleaningRules.table.value.all',
    defaultMessage: 'All',
  },
  datamartFilter: {
    id: 'settings.cleaningRules.table.datamartFilter',
    defaultMessage: 'Datamart',
  },
  noFilter: {
    id: 'settings.cleaningRules.table.value.noFilter',
    defaultMessage: 'No filter',
  },
  cleaningRules: {
    id: 'settings.cleaningRules',
    defaultMessage: 'Cleaning rules',
  },
  editCleaningRule: {
    id: 'settings.cleaningRules.table.column.action.edit',
    defaultMessage: 'View'
  },
  deleteCleaningRule: {
    id: 'settings.cleaningRules.table.column.action.delete',
    defaultMessage: 'Delete'
  },
  deleteCleaningRuleModalTitle: {
    id: 'settings.cleaningRules.delete.modal.title',
    defaultMessage: 'You are about to delete a cleaning rule. Do you want to proceed anyway?'
  },
  deleteCleaningRuleModalOk: {
    id: 'settings.cleaningRules.delete.modal.ok',
    defaultMessage: 'Delete now'
  },
  deleteCleaningRuleModalCancel: {
    id: 'settings.cleaningRules.delete.modal.cancel',
    defaultMessage: 'Cancel'
  },
  newCleaningRule: {
    id: 'settings.cleaningRules.list.new',
    defaultMessage: 'New Cleaning Rule'
  },
  updateStatusModalTitle: {
    id: 'settings.cleaningRules.table.column.updateStatus.modal.title',
    defaultMessage: 'Update cleaning rule status'
  },
  updateStatusModalConfirm: {
    id: 'settings.cleaningRules.table.column.updateStatus.modal.confirm',
    defaultMessage: 'Confirm'
  },
  updateStatusToLiveButton: {
    id: 'settings.cleaningRules.table.column.updateStatus.draftToLiveButton',
    defaultMessage: 'Activate the rule'
  },
  updateStatusToArchivedButton: {
    id: 'settings.cleaningRules.table.column.updateStatus.liveToArchivedButton',
    defaultMessage: 'Archive the rule'
  },
  updateStatusToLiveModalText: {
    id: 'settings.cleaningRule.updateStatus.modal.draftToLiveText',
    defaultMessage: 'You are about to activate the cleaning rule. This means that this rule will be applied to all new incoming activities.'
  },
  updateStatusToArchivedText: {
    id: 'settings.cleaningRules.updateStatus.modal.liveToArchivedText',
    defaultMessage: 'You are about to archive the cleaning rule. This means that this rule will not be applied anymore to all new incoming activites.'
  },
  updateCleaningRuleModalCancel: {
    id: 'settings.cleaningRules.updateStatus.modal.cancel',
    defaultMessage: 'Cancel'
  },
});

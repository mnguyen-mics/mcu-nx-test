import { defineMessages } from 'react-intl';

export default defineMessages({
  activityAnalyzer: {
    id: 'settings.activityAnalyzer.breadcrumb.title',
    defaultMessage: 'Activity Analyzers',
  },
  newActivityAnalyzer: {
    id: 'settings.activityAnalyzer.actionbar.button.new',
    defaultMessage: 'New Activity Analyzer',
  },
  activityAnalyzerArchiveTitle: {
    id: 'settings.activityAnalyzer.modal.archive.title',
    defaultMessage: 'Are you sure you want to archive this Activity Analyzer?',
  },
  activityAnalyzerArchiveMessage: {
    id: 'settings.activityAnalyzer.modal.archive.message',
    defaultMessage:
      'By archiving this Activity Analyzer it will stop campaigns using it. Are you sure?',
  },
  activityAnalyzerArchiveOk: {
    id: 'settings.activityAnalyzer.modal.archive.ok',
    defaultMessage: 'Archive Now',
  },
  activityAnalyzerArchiveCancel: {
    id: 'settings.activityAnalyzer.modal.archive.cancel',
    defaultMessage: 'Cancel',
  },
  name: {
    id: 'settings.activityAnalyzer.list.column.name',
    defaultMessage: 'Name',
  },
  processor: {
    id: 'settings.activityAnalyzer.list.column.processor',
    defaultMessage: 'Activity Analyser Processor',
  },
  provider: {
    id: 'settings.activityAnalyzer.list.column.provider',
    defaultMessage: 'Provider',
  },
  empty: {
    id: 'settings.activityAnalyzer.list.empty',
    defaultMessage: 'There is no Activity Analyzer List created yet! Click on New to get started',
  },
  edit: {
    id: 'settings.activityAnalyzer.list.actionColumn.edit',
    defaultMessage: 'Edit',
  },
  archive: {
    id: 'settings.activityAnalyzer.list.actionColumn.archive',
    defaultMessage: 'Archive',
  },
});

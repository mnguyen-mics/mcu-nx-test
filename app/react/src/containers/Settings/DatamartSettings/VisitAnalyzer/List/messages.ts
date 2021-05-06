import { defineMessages } from 'react-intl';

export default defineMessages({
  visitAnalyzer: {
    id: 'settings.visitAnalyzer.breadcrumb.title',
    defaultMessage: 'Visit Analyzers',
  },
  newVisitAnalyzer: {
    id: 'settings.visitAnalyzer.actionbar.button.new',
    defaultMessage: 'New Visit Analyzer',
  },
  visitAnalyzerArchiveTitle: {
    id: 'settings.visitAnalyzer.modal.archive.title',
    defaultMessage: 'Are you sure you want to archive this Visit Analyzer?',
  },
  visitAnalyzerArchiveMessage: {
    id: 'settings.visitAnalyzer.modal.archive.message',
    defaultMessage:
      'By archiving this Visit Analyzer it will stop campaigns using it. Are you sure?',
  },
  visitAnalyzerArchiveOk: {
    id: 'settings.visitAnalyzer.modal.archive.ok',
    defaultMessage: 'Archive Now',
  },
  visitAnalyzerArchiveCancel: {
    id: 'settings.visitAnalyzer.modal.archive.cancel',
    defaultMessage: 'Cancel',
  },
  name: {
    id: 'settings.visitAnalyzer.list.column.name',
    defaultMessage: 'Name',
  },
  processor: {
    id: 'settings.visitAnalyzer.list.column.processor',
    defaultMessage: 'Visit Analyser Processor',
  },
  provider: {
    id: 'settings.visitAnalyzer.list.column.provider',
    defaultMessage: 'Provider',
  },
  empty: {
    id: 'settings.visitAnalyzer.list.empty',
    defaultMessage: 'There is no Visit Analyzer List created yet! Click on New to get started',
  },
  edit: {
    id: 'settings.visitAnalyzer.list.actionColumn.edit',
    defaultMessage: 'Edit',
  },
  archive: {
    id: 'settings.visitAnalyzer.list.actionColumn.archive',
    defaultMessage: 'Archive',
  },
});

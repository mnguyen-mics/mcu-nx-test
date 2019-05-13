import { defineMessages } from 'react-intl';

export default defineMessages({
  bidoptimizer: {
    id: 'settings.bidoptimizer.breadcrumb.title',
    defaultMessage: 'Bid Optimizers',
  },
  newBidOptimizer: {
    id: 'settings.bidoptimizer.actionbar.button.new',
    defaultMessage: 'New Bid Optimizer',
  },
  bidOptimizerArchiveTitle: {
    id: 'settings.bidoptimizer.modal.archive.title',
    defaultMessage: 'Are you sure you want to archive this Bid Optimizer?',
  },
  bidOptimizerArchiveMessage: {
    id: 'settings.bidoptimizer.modal.archive.message',
    defaultMessage:
      'By archiving this Bid Optimizer it will stop campaigns using it. Are you sure?',
  },
  bidOptimizerArchiveOk: {
    id: 'settings.bidoptimizer.modal.archive.ok',
    defaultMessage: 'Archive Now',
  },
  bidOptimizerArchiveCancel: {
    id: 'settings.bidoptimizer.modal.archive.cancel',
    defaultMessage: 'Cancel',
  },
  name: {
    id: 'settings.bidoptimizer.list.column.name',
    defaultMessage: 'Name',
  },
  engine: {
    id: 'settings.bidoptimizer.list.column.engine',
    defaultMessage: 'Bid Optimizer Engine',
  },
  miner: {
    id: 'settings.bidoptimizer.list.column.miner',
    defaultMessage: 'Data Miner',
  },
  empty: {
    id: 'settings.bidoptimizer.list.empty',
    defaultMessage:
      'There is no Bid Optimizer created yet! Click on New to get started',
  },
  edit: {
    id: 'settings.bidoptimizer.list.actionColumn.edit',
    defaultMessage: 'Edit',
  },
  archive: {
    id: 'settings.bidoptimizer.list.actionColumn.archive',
    defaultMessage: 'Archive',
  },
});

import { defineMessages } from 'react-intl';

export default defineMessages({
  emailrouter: {
    id: 'settings.emailrouter.breadcrumb.title',
    defaultMessage: 'Email Routers',
  },
  newEmailRouter: {
    id: 'settings.emailrouter.actionbar.button.new',
    defaultMessage: 'New Email Router',
  },
  emailRouterArchiveTitle: {
    id: 'settings.emailrouter.modal.archive.title',
    defaultMessage: 'Are you sure you want to archive this Email Router?',
  },
  emailRouterArchiveMessage: {
    id: 'settings.emailrouter.modal.archive.message',
    defaultMessage: 'By archiving this Email Router it will stop campaigns using it. Are you sure?',
  },
  emailRouterArchiveOk: {
    id: 'settings.emailrouter.modal.archive.ok',
    defaultMessage: 'Archive Now',
  },
  emailRouterArchiveCancel: {
    id: 'settings.emailrouter.modal.archive.cancel',
    defaultMessage: 'Cancel',
  },
  name: {
    id: 'settings.emailrouter.list.column.name',
    defaultMessage: 'Name',
  },
  engine: {
    id: 'settings.emailrouter.list.column.engine',
    defaultMessage: 'Email Router Engine',
  },
  miner: {
    id: 'settings.emailrouter.list.column.miner',
    defaultMessage: 'Data Miner',
  },
  empty: {
    id: 'settings.emailrouter.list.empty',
    defaultMessage: 'There is no Email Routers created yet! Click on New to get started',
  },
  edit: {
    id: 'settings.emailrouter.list.actionColumn.edit',
    defaultMessage: 'Edit',
  },
  archive: {
    id: 'settings.emailrouter.list.actionColumn.archive',
    defaultMessage: 'Archive',
  },
});

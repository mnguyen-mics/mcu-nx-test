import { defineMessages } from 'react-intl';

export default defineMessages({
  emailrouter: {
    id: 'emailrouter.breadcrumb.title',
    defaultMessage: 'Email Routers',
  },
  newEmailRouter: {
    id: 'emailrouter.actionbar.button.new',
    defaultMessage: 'New Email Router',
  },
  emailRouterArchiveTitle: {
    id: 'emailrouter.modal.archive.title',
    defaultMessage: 'Are you sure you want to archive this Email Router?',
  },
  emailRouterArchiveMessage: {
    id: 'emailrouter.modal.archive.message',
    defaultMessage: 'By archiving this Email Router it will stop campaigns using it. Are you sure?',
  },
  emailRouterArchiveOk: {
    id: 'emailrouter.modal.archive.ok',
    defaultMessage: 'Archive Now',
  },
  emailRouterArchiveCancel: {
    id: 'emailrouter.modal.archive.cancel',
    defaultMessage: 'Cancel',
  },
  name: {
    id: 'emailrouter.table.column.name',
    defaultMessage: 'Name',
  },
  engine: {
    id: 'emailrouter.table.column.engine',
    defaultMessage: 'Email Router Engine',
  },
  miner: {
    id: 'emailrouter.table.column.miner',
    defaultMessage: 'Data Miner',
  },
  empty: {
    id: 'emailrouter.table.empty',
    defaultMessage: 'There is no Email Routers created yet! Click on New to get started',
  },
})
;

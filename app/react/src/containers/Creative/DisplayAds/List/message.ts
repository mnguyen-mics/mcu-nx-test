import { defineMessages } from 'react-intl';

export default defineMessages({
  creativeModalConfirmArchivedTitle: {
    id: 'creatives.display.list.modal.confirm.archived.title',
    defaultMessage: 'Are you sure to archive this creative ?',
  },
  creativeModalConfirmArchivedContent: {
    id: 'creatives.display.list.modal.confirm.archived.content',
    defaultMessage:
      "You can only archive creatives that haven't passed or failed the audit. If you have selected creatives wtih passed or failed audit status, please reset their audit status first before archiving.",
  },
  creativeModalConfirmArchivedOk: {
    id: 'creatives.display.list.modal.confirm.ok',
    defaultMessage: 'Archive Now',
  },
  cancelText: {
    id: 'creatives.display.list.modal.confirm.cancel',
    defaultMessage: 'Cancel',
  },
  creativeModalNoArchiveTitle: {
    id: 'creatives.display.list.modal.no.archive.title',
    defaultMessage: 'Forbidden action',
  },
  creativeModalNoArchiveMessage: {
    id: 'creatives.display.list.modal.no.archive.msg',
    defaultMessage:
      "You can't archive a creative in the audit status AUDIT_FAILED, AUDIT_PENDING or AUDIT_PASSED",
  },
  creativeModalSearchPlaceholder: {
    id: 'creatives.display.list.modal.search.placeholder',
    defaultMessage: 'Search Display Creative',
  },
  preview: {
    id: 'creatives.display.list.column.preview',
    defaultMessage: 'Preview',
  },
  name: {
    id: 'creatives.display.list.column.name',
    defaultMessage: 'Name',
  },
  auditStatus: {
    id: 'creatives.display.list.column.auditStatus',
    defaultMessage: 'Audit status',
  },
  publishedVersion: {
    id: 'creatives.display.list.column.publishedVersion',
    defaultMessage: 'Published version',
  },
  edit: {
    id: 'creatives.display.list.actionColumn.edit',
    defaultMessage: 'Edit',
  },
  archive: {
    id: 'creatives.display.list.actionColumn.archive',
    defaultMessage: 'Archive',
  },
  archiveSuccess: {
    id: 'archive.creatives.success.msg',
    defaultMessage: 'Creatives successfully archived',
  },
  archiveEmailSuccess: {
    id: 'archive.email.success.msg',
    defaultMessage: 'Email templates successfully archived',
  },
  searchPlaceholderEmail: {
    id: 'creative.email.list.searchPlaceholder',
    defaultMessage: 'Search Email Templates',
  },
  sendTest: {
    id: 'creative.email.list.sendTest',
    defaultMessage: 'Send a test Email',
  },
  noDisplayCreative: {
    id: 'creative.display.list.noCreative',
    defaultMessage: 'No Display Creatives',
  },
  noEmailTemplate: {
    id: 'creative.email.list.noTemplate',
    defaultMessage: 'No Email Templates',
  },
});

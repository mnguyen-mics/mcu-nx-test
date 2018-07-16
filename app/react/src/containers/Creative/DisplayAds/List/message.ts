import { defineMessages } from 'react-intl';

export default defineMessages({
    creativeModalConfirmArchivedTitle: {
        id: 'creative.modal.confirm.archived.title',
        defaultMessage: 'Are you sure to archive this creative ?',
    },
    creativeModalConfirmArchivedContent: {
        id: 'creative.modal.confirm.archived.content',
        defaultMessage: 'You can only archive creatives that haven\'t passed or failed the audit. If you have selected creatives wtih passed or failed audit status, please reset their audit status first before archiving.',
    },
    creativeModalConfirmArchivedOk: {
        id: 'creative.modal.confirm.ok',
        defaultMessage: 'Archive Now',
    },
    cancelText: {
        id: 'creative.modal.confirm.cancel',
        defaultMessage: 'Cancel',
    },
    creativeModalNoArchiveTitle: {
        id: 'creative.modal.no.archive.title',
        defaultMessage: 'Forbidden action',
    },
    creativeModalNoArchiveMessage: {
        id: 'creative.modal.no.archive.msg',
        defaultMessage: 'You can\'t archive a creative in the audit status AUDIT_FAILED, AUDIT_PENDING or AUDIT_PASSED',
    },
    creativeModalSearchPlaceholder: {
        id: 'creative.modal.search.placeholder',
        defaultMessage: 'Search Display Creative',
    }
});

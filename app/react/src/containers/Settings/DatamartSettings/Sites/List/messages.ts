import { defineMessages } from 'react-intl';

const messages = defineMessages({
  searchPlaceholder: {
    id: 'settings.datamart.site.list.search.placeholder',
    defaultMessage: 'Search Sites',
  },
  siteName: {
    id: 'settings.datamart.site.list.name',
    defaultMessage: 'Name',
  },
  siteToken: {
    id: 'settings.datamart.site.list.token',
    defaultMessage: 'Token',
  },
  siteCreationDate: {
    id: 'settings.datamart.site.list.creation_date',
    defaultMessage: 'Creation Date',
  },
  newSite: {
    id: 'settings.datamart.site.list.new',
    defaultMessage: 'New Site',
  },
  editSite: {
    id: 'settings.datamart.site.list.edit',
    defaultMessage: 'Edit',
  },
  deleteSite: {
    id: 'settings.datamart.site.list.delete',
    defaultMessage: 'Delete',
  },
  emptySites: {
    id: 'settings.datamart.site.list.empty',
    defaultMessage: "There are no sites set up. Click on 'New Site' to create one.",
  },
  deleteSiteModalTitle: {
    id: 'settings.datamart.site.delete.modal.title',
    defaultMessage: "You are about to delete a channel from your datamart. This action cannot be undone. Do you want to proceed anyway ?",
  },
  deleteSiteModalOk: {
    id: 'settings.datamart.site.delete.modal.ok',
    defaultMessage: "Delete Now",
  },
  deleteSiteModalCancel: {
    id: 'settings.datamart.site.delete.modal.cancel',
    defaultMessage: "Cancel",
  },
});

export default messages;

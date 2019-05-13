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
  archiveSite: {
    id: 'settings.datamart.site.list.archive',
    defaultMessage: 'Archive',
  },
  emptySites: {
    id: 'settings.datamart.site.list.empty',
    defaultMessage: "There are no sites set up. Click on 'New Site' to create one.",
  },
});

export default messages;

import { defineMessages } from 'react-intl';

const messages = defineMessages({
  searchPlaceholder: {
    id: 'site.search.placeholder',
    defaultMessage: 'Search Sites'
  },
  siteName: {
    id: 'site.name',
    defaultMessage: 'Name'
  },
  siteToken: {
    id: 'site.token',
    defaultMessage: 'Token'
  },
  siteCreationDate: {
    id: 'site.creation_date',
    defaultMessage: 'Creation Date'
  },
  newSite: {
    id: 'site.new',
    defaultMessage: 'New Site'
  },
  editSite: {
    id: 'site.edit',
    defaultMessage: 'Edit'
  },
  archiveSite: {
    id: 'site.archive',
    defaultMessage: 'Archive'
  },
  emptySites: {
    id: 'site.empty',
    defaultMessage: "There are no sites set up. Click on 'New Site' to create one."
  },
});

export default messages;

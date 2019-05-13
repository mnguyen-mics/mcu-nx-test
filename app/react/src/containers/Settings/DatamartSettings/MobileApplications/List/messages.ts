import { defineMessages } from 'react-intl';

const messages = defineMessages({
  searchPlaceholder: {
    id: 'settings.mobilApplication.search.placeholder',
    defaultMessage: 'Search Mobile Applications',
  },
  mobileApplicationName: {
    id: 'settings.mobilApplication.name',
    defaultMessage: 'Name',
  },
  mobileApplicationToken: {
    id: 'settings.mobilApplication.token',
    defaultMessage: 'Token',
  },
  mobileApplicationCreationDate: {
    id: 'settings.mobilApplication.creation_date',
    defaultMessage: 'Creation Date',
  },
  newMobileApplication: {
    id: 'settings.mobilApplication.new',
    defaultMessage: 'New Mobile Application',
  },
  editMobileApplication: {
    id: 'settings.mobilApplication.edit',
    defaultMessage: 'Edit',
  },
  archiveMobileApplication: {
    id: 'settings.mobilApplication.archive',
    defaultMessage: 'Archive',
  },
  emptyMobileApplications: {
    id: 'settings.mobilApplication.empty',
    defaultMessage: "There are no mobile apps set up. Click on 'New Mobile Application' to create one.",
  },
});

export default messages;

import { defineMessages } from 'react-intl';

const messages = defineMessages({
  newChannel: {
    id: 'settings.datamart.channels.new',
    defaultMessage: 'New Channel',
  },
  newSite: {
    id: 'settings.datamart.channels.new.site',
    defaultMessage: 'New Site',
  },
  newMobileApplication: {
    id: 'settings.datamart.channels.new.mobileApplication',
    defaultMessage: 'New Mobile Application',
  },
  datamartFilter: {
    id: 'settings.datamart.channels.datamartFilter',
    defaultMessage: 'Datamart',
  },
  channelTypeFilter: {
    id: 'settings.datamart.channels.channelTypeFilter',
    defaultMessage: 'Channel type',
  },
  channels: {
    id: 'settings.tab.title.channels',
    defaultMessage: 'Channels',
  },
  channelName: {
    id: 'settings.datamart.channels.list.name',
    defaultMessage: 'Name',
  },
  channelToken: {
    id: 'settings.datamart.channels.list.token',
    defaultMessage: 'Token',
  },
  channelType: {
    id: 'settings.datamart.channels.list.type',
    defaultMessage: 'Type',
  },
  channelDatamartId: {
    id: 'settings.datamart.channels.list.datamart.id',
    defaultMessage: 'Datamart Id',
  },
  channelDatamartName: {
    id: 'settings.datamart.channels.list.datamart.name',
    defaultMessage: 'Datamart',
  },
  channelCreationDate: {
    id: 'settings.datamart.channels.list.creation_date',
    defaultMessage: 'Creation Date',
  },
  editChannel: {
    id: 'settings.datamart.channels.list.edit',
    defaultMessage: 'Edit',
  },
  deleteChannel: {
    id: 'settings.datamart.channels.list.delete',
    defaultMessage: 'Delete',
  },
  deleteChannelModalTitle: {
    id: 'settings.datamart.channel.delete.modal.title',
    defaultMessage: "You are about to delete a channel from your datamart. This action cannot be undone. Do you want to proceed anyway ?",
  },
  deleteChannelModalOk: {
    id: 'settings.datamart.channel.delete.modal.ok',
    defaultMessage: "Delete Now",
  },
  deleteChannelModalCancel: {
    id: 'settings.datamart.channel.delete.modal.cancel',
    defaultMessage: "Cancel",
  },
  emptyChannels: {
    id: 'settings.datamart.channels.list.empty',
    defaultMessage:
      "There are no channels of the selected type set up. Click on 'New Channel' to create one.",
  },
  searchPlaceholder: {
    id: 'settings.datamart.channels.placeholder',
    defaultMessage: 'Search Channels',
  },
  lastSevenDaysSessions: {
    id: 'settings.datamart.channels.last.seven.days.sessions',
    defaultMessage: 'Sessions in the last 7 days',
  },
  lastSevenDaysUsers: {
    id: 'settings.datamart.channels.last.seven.days.unique.users',
    defaultMessage: 'Unique users in the last 7 days',
  },
});

export default messages;

import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  datamartReplication: {
    id: 'settings.datamart.datamartReplication.title',
    defaultMessage: 'Datamart Replication',
  },
  datamartReplications: {
    id: 'settings.datamart.datamartReplication.list.title',
    defaultMessage: 'Datamart Replications',
  },
  searchPlaceholder: {
    id: 'settings.datamart.datamartReplication.search.placeholder',
    defaultMessage: 'Search Datamart Replications',
  },
  datamartReplicationName: {
    id: 'settings.datamart.datamartReplication.list.column.name',
    defaultMessage: 'Name',
  },
  datamartReplicationDatamartId: {
    id: 'settings.datamart.datamartReplication.list.column.datamartId',
    defaultMessage: 'Datamart ID',
  },
  datamartReplicationXXX: {
    id: 'settings.datamart.datamartReplication.list.column.XXX',
    defaultMessage: 'XXX',
  },
  newDatamartReplication: {
    id: 'settings.datamart.datamartReplication.newDatamartButton',
    defaultMessage: 'New Datamart Replicaton',
  },
  editDatamartReplication: {
    id: 'settings.datamart.datamartReplication.list.editButton',
    defaultMessage: 'Edit',
  },
  archiveDatamartReplication: {
    id: 'settings.datamart.datamartReplication.list.archiveButton',
    defaultMessage: 'Archive',
  },
  emptyDatamartReplication: {
    id: 'settings.datamart.datamartReplication.emptyLit',
    defaultMessage:
      "There are no datamart replication set up. Click on 'New Datamart Replication' to create one.",
  },
});

export default messages;

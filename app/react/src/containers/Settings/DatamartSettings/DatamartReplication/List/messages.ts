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
  datamartReplicationType: {
    id: 'settings.datamart.datamartReplication.list.column.type',
    defaultMessage: 'Type',
  },
  datamartReplicationProperties: {
    id: 'settings.datamart.datamartReplication.list.column.properties',
    defaultMessage: 'Properties',
  },
  datamartReplicationXXX: {
    id: 'settings.datamart.datamartReplication.list.column.XXX',
    defaultMessage: 'XXX',
  },
  newDatamartReplication: {
    id: 'settings.datamart.datamartReplication.newDatamartButton',
    defaultMessage: 'New Datamart Replication',
  },
  editDatamartReplication: {
    id: 'settings.datamart.datamartReplication.list.editButton',
    defaultMessage: 'Edit',
  },
  deleteDatamartReplication: {
    id: 'settings.datamart.datamartReplication.list.deleteButton',
    defaultMessage: 'Delete',
  },

  deleteDatamartReplicationModalTitle: {
    id: 'settings.datamart.datamartReplication.list.deleteModalTitle',
    defaultMessage:
      'Are you sure you want to delete this datamart replication ?',
  },
  deleteDatamartReplicationModalContent: {
    id: 'settings.datamart.datamartReplication.list.deleteModalContent',
    defaultMessage:
      'By deleting this datamart replication, you will not be able to retrieve it. Are you sure ?',
  },
  deleteDatamartReplicationModalCancel: {
    id: 'settings.datamart.datamartReplication.list.cancelModalButton',
    defaultMessage: 'Cancel',
  },
  emptyDatamartReplication: {
    id: 'settings.datamart.datamartReplication.emptyList',
    defaultMessage:
      "There are no datamart replications set up. Click on 'New Datamart Replication' to create one.",
  },
  sectionGeneralSubTitle: {
    id: 'settings.datamart.datamartReplication.edit.generalSection.subTitle',
    defaultMessage: 'Give your datamart replication a name',
  },
  sectionGeneralTitle: {
    id: 'settings.datamart.datamartReplication.edit.generalSection.title',
    defaultMessage: 'General Information',
  },
  saveDatamartReplication: {
    id: 'settings.datamart.datamartReplication.edit.saveReplication',
    defaultMessage: 'Save Datamart Replication',
  },
  datamartReplicationTypeSelectionTitle: {
    id: 'settings.datamart.datamartReplication.edit.typeSelection.title',
    defaultMessage: 'Datamart Replication Type',
  },
  datamartReplicationTypeSelectionSubtitle: {
    id: 'settings.datamart.datamartReplication.edit.typeSelection.subtitle',
    defaultMessage: 'Choose your datamart replication type.',
  },
  // Name
  datamartReplicationNamePlaceHolder: {
    id: 'settings.datamart.datamartReplication.edit.name.placeholder',
    defaultMessage: 'Datamart Replication Name',
  },
  datamartReplicationNameTooltip: {
    id: 'settings.datamart.datamartReplication.edit.name.tootltip',
    defaultMessage: 'Give your datamart replication a name',
  },
  datamartReplicationNameLabel: {
    id: 'settings.datamart.datamartReplication.edit.name.label',
    defaultMessage: 'Name',
  },
  // crendentials URI
  datamartReplicationCredentialsUriPlaceHolder: {
    id: 'settings.datamart.datamartReplication.edit.credentailsUri.placeholder',
    defaultMessage: 'Datamart Replication Credentials URI',
  },
  datamartReplicationCredentialsUriTooltip: {
    id: 'settings.datamart.datamartReplication.edit.credentailsUri.tootltip',
    defaultMessage: 'Give your datamart replication credentials URI',
  },
  datamartReplicationCredentialsUriLabel: {
    id: 'settings.datamart.datamartReplication.edit.credentailsUri.label',
    defaultMessage: 'Credentials URI',
  },
  // Project ID
  datamartReplicationProjectIdPlaceHolder: {
    id: 'settings.datamart.datamartReplication.edit.projectId.placeholder',
    defaultMessage: 'Datamart Replication Project ID',
  },
  datamartReplicationProjectIdTooltip: {
    id: 'settings.datamart.datamartReplication.edit.projectId.tootltip',
    defaultMessage: 'Give your datamart replication a project ID',
  },
  datamartReplicationProjectIdLabel: {
    id: 'settings.datamart.datamartReplication.edit.projectId.label',
    defaultMessage: 'Project ID',
  },
  // topic ID
  datamartReplicationTopicIdPlaceHolder: {
    id: 'settings.datamart.datamartReplication.edit.topicId.placeholder',
    defaultMessage: 'Datamart Replication Topic ID',
  },
  datamartReplicationTopicIdTooltip: {
    id: 'settings.datamart.datamartReplication.edit.topicId.tootltip',
    defaultMessage: 'Give your datamart replication a topic ID',
  },
  datamartReplicationTopicIdLabel: {
    id: 'settings.datamart.datamartReplication.edit.topic.label',
    defaultMessage: 'Topic ID',
  },
  savingInProgress: {
    id: 'settings.datamart.datamartReplication.edit.savingInProgess',
    defaultMessage: 'Saving in progress',
  },
  noDatamartId: {
    id: 'settings.datamart.datamartReplication.save.error.noDatamartId',
    defaultMessage: 'No datamartId specified',
  },
  sectionCustomSubtitle: {
    id: 'settings.datamart.datamartReplication.edit.customSection.subTitle',
    defaultMessage: 'Give your datamart replication specific properties',
  },
  sectionCustomTitle: {
    id: 'settings.datamart.datamartReplication.edit.customSection.title',
    defaultMessage: 'Specific Information',
  },
  seeReplicationProperties: {
    id: 'settings.datamart.datamartReplication.list.column.seeProperties',
    defaultMessage: 'See replication properties',
  },
  replicationProperties: {
    id: 'settings.datamart.datamartReplication.list.modalPropertiesTitle',
    defaultMessage: 'All replication properties',
  },
  archiveReplicationModalTitle: {
    id: 'settings.datamart.datamartReplication.dashboard.archiveModalTitle',
    defaultMessage:
      'Are you sure you want to delete this datamart replication ?',
  },
  archiveReplicationModalContent: {
    id: 'settings.datamart.datamartReplication.dashboard.archiveModalContent',
    defaultMessage:
      "By deleting this datamart replication you won't be able to retrieve it. Are you sure ?",
  },
  archiveReplicationModalOk: {
    id: 'settings.datamart.datamartReplication.dashboard.archiveModalOk',
    defaultMessage: 'Delete',
  },
  archiveReplicationModalCancel: {
    id: 'settings.datamart.datamartReplication.dashboard.archiveModalCancel',
    defaultMessage: 'Cancel',
  },
  newExecution: {
    id: 'settings.datamart.datamartReplication.dashboard.newExecutionButton',
    defaultMessage: 'New execution',
  },
  jobExecutions: {
    id: 'settings.datamart.datamartReplication.dashboard.jobExecutionsTitle',
    defaultMessage: 'Jobs Executions',
  },
  executionId: {
    id: 'settings.datamart.datamartReplication.dashboard.executionId',
    defaultMessage: 'Id',
  },
  executionStatus: {
    id: 'settings.datamart.datamartReplication.dashboard.executionStatus',
    defaultMessage: 'Status',
  },
  executionProgress: {
    id: 'settings.datamart.datamartReplication.dashboard.executionProgress',
    defaultMessage: 'Progress',
  },
  executionStartDate: {
    id: 'settings.datamart.datamartReplication.dashboard.executionStartDate',
    defaultMessage: 'Start Date',
  },
  executionCreationDate: {
    id: 'settings.datamart.datamartReplication.dashboard.executionCreationDate',
    defaultMessage: 'Creation Date',
  },
  executionEndDate: {
    id: 'settings.datamart.datamartReplication.dashboard.executionEndDate',
    defaultMessage: 'End Date',
  },
  executionNotStarted: {
    id: 'settings.datamart.datamartReplication.dashboard.executionNotStarted',
    defaultMessage: 'Not started',
  },
  executionNotCreated: {
    id: 'settings.datamart.datamartReplication.dashboard.executionNotCreated',
    defaultMessage: 'Not created',
  },
  executionNotEnded: {
    id: 'settings.datamart.datamartReplication.dashboard.executionNotEnded',
    defaultMessage: 'Not ended',
  },
});

export default messages;

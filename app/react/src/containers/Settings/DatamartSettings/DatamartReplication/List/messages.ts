import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  datamartReplication: {
    id: 'settings.datamart.datamartReplication.title',
    defaultMessage: 'Replication',
  },
  datamartReplications: {
    id: 'settings.datamart.datamartReplication.list.title',
    defaultMessage: 'Replications',
  },
  searchPlaceholder: {
    id: 'settings.datamart.datamartReplication.search.placeholder',
    defaultMessage: 'Search Replications',
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
  newDatamartReplication: {
    id: 'settings.datamart.datamartReplication.newDatamartButton',
    defaultMessage: 'New Replication',
  },
  editDatamartReplication: {
    id: 'settings.datamart.datamartReplication.list.editButton',
    defaultMessage: 'Edit',
  },
  deleteDatamartReplication: {
    id: 'settings.datamart.datamartReplication.list.deleteButton',
    defaultMessage: 'Delete',
  },
  datamartReplicationStatus: {
    id: 'settings.datamart.datamartReplication.list.column.status',
    defaultMessage: 'Status',
  },
  deleteDatamartReplicationModalTitle: {
    id: 'settings.datamart.datamartReplication.list.deleteModalTitle',
    defaultMessage:
      'Are you sure you want to delete this Replication ?',
  },
  deleteDatamartReplicationModalContent: {
    id: 'settings.datamart.datamartReplication.list.deleteModalContent',
    defaultMessage:
      'By deleting this Replication, you will not be able to retrieve it. Are you sure ?',
  },
  deleteDatamartReplicationModalCancel: {
    id: 'settings.datamart.datamartReplication.list.cancelModalButton',
    defaultMessage: 'Cancel',
  },
  emptyDatamartReplicationList: {
    id: 'settings.datamart.datamartReplication.emptyList',
    defaultMessage:
      "There is no Replication set up. Click on 'New Datamart Replication' to create one.",
  },
  emptyInitialSynchronizationList: {
    id: 'settings.datamart.datamartReplication.dashboard.emptyExecutionList',
    defaultMessage:
      "There is no Initial Synchronization set up. Click on 'New Execution' to launch one.",
  },
  emptyJobExecution: {
    id: 'settings.datamart.datamartReplicationJob.emptyList',
    defaultMessage:
      "There are no Replication Jobs. Click on 'New Execution' to run one.",
  },
  sectionGeneralSubTitle: {
    id: 'settings.datamart.datamartReplication.edit.generalSection.subTitle',
    defaultMessage: 'Give your Replication a name',
  },
  sectionGeneralTitle: {
    id: 'settings.datamart.datamartReplication.edit.generalSection.title',
    defaultMessage: 'General Information',
  },
  sectionActivationSubTitle: {
    id: 'settings.datamart.datamartReplication.edit.activationSection.subTitle',
    defaultMessage:
      'Choose to activate your Replication after creation',
  },
  sectionActivationTitle: {
    id: 'settings.datamart.datamartReplication.edit.activationSection.title',
    defaultMessage: 'Activation',
  },
  saveDatamartReplication: {
    id: 'settings.datamart.datamartReplication.edit.saveReplication',
    defaultMessage: 'Save Replication',
  },
  datamartReplicationTypeSelectionTitle: {
    id: 'settings.datamart.datamartReplication.edit.typeSelection.title',
    defaultMessage: 'Replication Type',
  },
  datamartReplicationTypeSelectionSubtitle: {
    id: 'settings.datamart.datamartReplication.edit.typeSelection.subtitle',
    defaultMessage: 'Choose your Replication type.',
  },
  // Name
  datamartReplicationNamePlaceHolder: {
    id: 'settings.datamart.datamartReplication.edit.name.placeholder',
    defaultMessage: 'Replication Name',
  },
  datamartReplicationNameTooltip: {
    id: 'settings.datamart.datamartReplication.edit.name.tootltip',
    defaultMessage: 'Give your Replication a name',
  },
  datamartReplicationNameLabel: {
    id: 'settings.datamart.datamartReplication.edit.name.label',
    defaultMessage: 'Name',
  },
  // crendentials URI
  datamartReplicationCredentialsUriPlaceHolder: {
    id: 'settings.datamart.datamartReplication.edit.credentailsUri.placeholder',
    defaultMessage: 'Replication Credentials URI',
  },
  datamartReplicationCredentialsUriTooltip: {
    id: 'settings.datamart.datamartReplication.edit.credentailsUri.tootltip',
    defaultMessage: 'Give your Replication credentials URI',
  },
  datamartReplicationCredentialsUriLabel: {
    id: 'settings.datamart.datamartReplication.edit.credentailsUri.label',
    defaultMessage: 'Credentials URI',
  },
  // Project ID
  datamartReplicationProjectIdPlaceHolder: {
    id: 'settings.datamart.datamartReplication.edit.projectId.placeholder',
    defaultMessage: 'Replication Project ID',
  },
  datamartReplicationProjectIdTooltip: {
    id: 'settings.datamart.datamartReplication.edit.projectId.tootltip',
    defaultMessage: 'Give your Replication a project ID',
  },
  datamartReplicationProjectIdLabel: {
    id: 'settings.datamart.datamartReplication.edit.projectId.label',
    defaultMessage: 'Project ID',
  },
  // topic ID
  datamartReplicationTopicIdPlaceHolder: {
    id: 'settings.datamart.datamartReplication.edit.topicId.placeholder',
    defaultMessage: 'Replication Topic ID',
  },
  datamartReplicationTopicIdTooltip: {
    id: 'settings.datamart.datamartReplication.edit.topicId.tootltip',
    defaultMessage: 'Give your Replication a topic ID',
  },
  datamartReplicationTopicIdLabel: {
    id: 'settings.datamart.datamartReplication.edit.topic.label',
    defaultMessage: 'Topic ID',
  },
  savingInProgress: {
    id: 'settings.datamart.datamartReplication.edit.savingInProgess',
    defaultMessage: 'Saving in progress',
  },
  sectionCustomSubtitle: {
    id: 'settings.datamart.datamartReplication.edit.customSection.subTitle',
    defaultMessage: 'Give your Replication specific properties',
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
      'Are you sure you want to delete this Replication ?',
  },
  archiveReplicationModalContent: {
    id: 'settings.datamart.datamartReplication.dashboard.archiveModalContent',
    defaultMessage:
      "By deleting this Replication you won't be able to retrieve it. Are you sure ?",
  },
  archiveReplicationModalOk: {
    id: 'settings.datamart.datamartReplication.dashboard.archiveModalOk',
    defaultMessage: 'Delete',
  },
  cancelAction: {
    id: 'settings.datamart.datamartReplication.dashboard.archiveModalCancel',
    defaultMessage: 'Cancel',
  },
  newExecution: {
    id: 'settings.datamart.datamartReplication.dashboard.newExecutionButton',
    defaultMessage: 'New Execution',
  },
  initialSynchronization: {
    id: 'settings.datamart.datamartReplication.dashboard.jobExecutionsTitle',
    defaultMessage: 'Initial Synchronization',
  },
  jobIsRunning: {
    id: 'settings.datamart.datamartReplication.dashboard.jobIsRunning',
    defaultMessage: 'Job is running',
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
  noExecutionModalTitle: {
    id:
      'settings.datamart.datamartReplication.dashboard.executionModal.title.no',
    defaultMessage:
      "You don't have any ACTIVE Replication (Replication with status 'ACTIVE')",
  },
  noExecutionModalContent: {
    id:
      'settings.datamart.datamartReplication.dashboard.executionModal.content.no',
    defaultMessage: "You can't execute an Initial Synchronization.",
  },
  executionModalTitle: {
    id: 'settings.datamart.datamartReplication.dashboard.executionModal.title',
    defaultMessage:
      'You are about to execute an Initial Synchronization. This operation will replicate every current data from your datamart to your external solution for the following Replication(s):',
  },
  executionModalContent: {
    id:
      'settings.datamart.datamartReplication.dashboard.executionModal.content',
    defaultMessage:
      'When Initial Synchronization is running, you can’t change status of any of your replications until synchronization is completed. You can execute an Initial Synchronization once a week. Would you like to execute an Initial Synchronization now ?',
  },
  noExecutionPossible: {
    id: 'settings.datamart.datamartReplication.dashboard.noExecutionPossible',
    defaultMessage:
      "You can't execute Initial Synchronization more than once a week.",
  },
});

export default messages;

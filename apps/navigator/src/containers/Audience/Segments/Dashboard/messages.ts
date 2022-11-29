import { ValueFormat } from './../../../ResourceHistory/utils';
import { defineMessages, MessageDescriptor } from 'react-intl';
import {
  AudienceSegmentResource,
  AudienceSegmentType,
  UserQuerySegmentSubtype,
  FeedType,
} from '../../../../models/audiencesegment/AudienceSegmentResource';
import { HistoryKeys, formatToFormattingFunction } from '../../../ResourceHistory/utils';

export default defineMessages({
  // Segment
  audienceSegment: {
    id: 'audience.segments',
    defaultMessage: 'Segments',
  },
  userPoints: {
    id: 'audience.segments.user_points',
    defaultMessage: 'User Points',
  },
  userAccounts: {
    id: 'audience.segments.user_accounts',
    defaultMessage: 'User Accounts',
  },
  emails: {
    id: 'audience.segments.emails',
    defaultMessage: 'Emails',
  },
  mobile_cookie_ids: {
    id: 'audience.segments.mobile_cookie_ids',
    defaultMessage: 'Mobile Cookies',
  },
  mobile_ad_ids: {
    id: 'audience.segments.mobile_ad_ids',
    defaultMessage: 'Mobile IDs',
  },
  creation_ts: {
    id: 'audience.segments.creation_ts',
    defaultMessage: 'Creation date',
  },
  short_description: {
    id: 'audience.segments.short_description',
    defaultMessage: 'Short Description',
  },
  desktopCookieId: {
    id: 'audience.segments.desktop_cookie_ids',
    defaultMessage: 'Display Cookies',
  },
  userPointAddition: {
    id: 'audience.segments.user_point_additions',
    defaultMessage: 'User Point Additions',
  },
  userPointDeletion: {
    id: 'audience.segments.user_point_deletions',
    defaultMessage: 'User Point Deletions',
  },
  // Overlap
  overlap: {
    id: 'audience.segments.overlap',
    defaultMessage: 'Audience Segment Overlap',
  },
  overlapNumber: {
    id: 'audience.segments.overlap_number',
    defaultMessage: 'Overlap Number',
  },
  modalOverlapContentMessage: {
    id: 'audience.segments.overlap.modal.content',
    defaultMessage:
      'By clicking on OK you will create an overlap of the selected segment. Be carefull, this operation can take a significant amount of time.',
  },
  modalOverlapContentTitle: {
    id: 'audience.segments.overlap.modal.title',
    defaultMessage: 'Create an Overlap Analysis',
  },
  generated: {
    id: 'audience.segments.overlap.time.generated',
    defaultMessage: 'Generated',
  },
  refresh: {
    id: 'audience.segments.overlap.button.refresh',
    defaultMessage: 'Refresh',
  },
  createOverlap: {
    id: 'audience.segments.overlap.button.create',
    defaultMessage: 'Create Overlap Analysis',
  },
  overlapFetchingError: {
    id: 'audience.segments.overlap.error',
    defaultMessage: 'An unexpected error happened running your overlap. Please retry.',
  },
  experimentationCreation: {
    id: 'audience.segments.experimentation.creation',
    defaultMessage: 'Create Experimentation',
  },
  lookAlikeCreation: {
    id: 'audience.segments.lookalike.button.create',
    defaultMessage: 'Create Lookalike',
  },
  lookAlikeModalTitle: {
    id: 'audience.segments.lookalike.modal.title',
    defaultMessage: 'Create Lookalike',
  },
  lookAlikeModalHelper: {
    id: 'audience.segments.lookalike.modal.helper',
    defaultMessage:
      'To create a Lookalike, please select a partition and your extension ratio. Your segment will then be overlapped against the partition selected and the most overlapping partitions will be added to your base segment.',
  },
  cohortLookAlikeModalHelper: {
    id: 'audience.segments.lookalike.cohort.modal.helper',
    defaultMessage:
      'Please fill a name and a description (optional) for your lookalike segment. You will be able to calibrate the lookalike after its creation.',
  },
  lookAlikeModalNameLabel: {
    id: 'audience.segments.lookalike.modal.name.label',
    defaultMessage: 'Segment Name',
  },
  lookAlikeModalDescriptionLabel: {
    id: 'audience.segments.lookalike.modal.description.label',
    defaultMessage: 'Description',
  },
  lookAlikeModalPartitionLabel: {
    id: 'audience.segments.lookalike.modal.partition.label',
    defaultMessage: 'Partition',
  },
  lookAlikeModalExtentionFactorLabel: {
    id: 'audience.segments.lookalike.modal.extensionFactor.label',
    defaultMessage: 'Extension Factor',
  },
  lookAlikeCalibrationExecution: {
    id: 'audience.segments.lookalike.button.calibration.execution',
    defaultMessage: 'Calibrate',
  },
  lookAlikeCalibrationRunning: {
    id: 'audience.segments.lookalike.button.calibration.executing',
    defaultMessage: 'Calibration Ongoing',
  },
  lookAlikeCalibrationErrorSuccess: {
    id: 'audience.segments.lookalike.button.calibration.done',
    defaultMessage: 'Recalibrate',
  },
  USER_POINT_ADDITIONS: {
    id: 'audience.segments.additiondeletions.userpointaddition.label',
    defaultMessage: 'Userpoint Additions',
  },
  USER_POINT_DELETIONS: {
    id: 'audience.segments.additiondeletions.userpointdeletion.label',
    defaultMessage: 'Userpoint Deletions',
  },
  noAdditionDeletion: {
    id: 'audience.segments.additiondeletions.nodata',
    defaultMessage: 'There is no data on the selected period!',
  },
  audienceSegmentsExportTitle: {
    id: 'audience.segments.actionbar.export.title',
    defaultMessage: 'Audience Segments Export',
  },
  type: {
    id: 'audience.segments.export.column.type',
    defaultMessage: 'Type',
  },
  name: {
    id: 'audience.segments.export.column.name',
    defaultMessage: 'Name',
  },
  technicalName: {
    id: 'audience.segments.export.column.technicalName',
    defaultMessage: 'Technical Name',
  },
  addition: {
    id: 'audience.segments.export.column.addition',
    defaultMessage: 'Addition',
  },
  deletion: {
    id: 'audience.segments.export.column.deletion',
    defaultMessage: 'Deletion',
  },
  lookalikeTypeSelectorTitle: {
    id: 'audience.segments.lookaliketypeSelector.title',
    defaultMessage: 'Select your lookalike type',
  },
  lookalikeTypeSelectorsubTitle: {
    id: 'audience.segments.lookaliketypeSelector.subtitle',
    defaultMessage:
      'Choose between the {nbOfTypes} following lookalike { nbOfTypes, plural, one { type } other { types }}',
  },
  extensionFactor: {
    id: 'audience.segments.lookalikeCreation.extension',
    defaultMessage: 'Extension Factor',
  },
  similarity: {
    id: 'audience.segments.lookalikeCreation.similarity',
    defaultMessage: 'Similarity',
  },
  lookalikeTooBroad: {
    id: 'audience.segments.lookalikeCreation.lookalikeTooBroad',
    defaultMessage: 'Lookalike is too broad.',
  },
  tooltipExtensionFactor: {
    id: 'audience.segments.lookalikeCreation.extension.tooltip',
    defaultMessage:
      'An extension factor of N means that the N most overlapping partitions will be added to your base segment.',
  },
  extensionFactorError: {
    id: 'audience.segments.lookalikeCreation.extension.error',
    defaultMessage: 'Select a partition before choosing an extension factor.',
  },
  seeToControlGroupDashboard: {
    id: 'audience.segments.ABComparisonDashboard.controlGroupDashboardButton',
    defaultMessage: 'See Control Group Dashboard',
  },
  history: {
    id: 'audience.segments.actionbar.history',
    defaultMessage: 'History',
  },
});

type ExtraKeys = 'last_modified_ts';

export const audienceSegmentTypeMessages: {
  [key in AudienceSegmentType]: MessageDescriptor;
} = defineMessages({
  USER_LIST: {
    id: 'audience.segments.type.userList',
    defaultMessage: 'User List',
  },
  USER_QUERY: {
    id: 'audience.segments.type.userQuery',
    defaultMessage: 'User Query',
  },
  USER_ACTIVATION: {
    id: 'audience.segments.type.userActivation',
    defaultMessage: 'User Activation',
  },
  USER_PARTITION: {
    id: 'audience.segments.type.userPartition',
    defaultMessage: 'User Partition',
  },
  USER_PIXEL: {
    id: 'audience.segments.type.userPixel',
    defaultMessage: 'User Pixel',
  },
  USER_LOOKALIKE: {
    id: 'audience.segments.type.userLookalike',
    defaultMessage: 'User Lookalike',
  },
  USER_LOOKALIKE_BY_COHORTS: {
    id: 'audience.segments.type.userLookalikeByCohort',
    defaultMessage: 'User Cohort Lookalike',
  },
  USER_CLIENT: {
    id: 'audience.segments.type.userClient',
    defaultMessage: 'EDGE',
  },
  EDGE: {
    id: 'audience.segments.type.edge',
    defaultMessage: 'EDGE',
  },
});

export const userListFeedTypeMessages: {
  [key in FeedType]: MessageDescriptor;
} = defineMessages({
  FILE_IMPORT: {
    id: 'audience.segments.type.userList.feedType.fileImport',
    defaultMessage: 'File Import',
  },
  SCENARIO: {
    id: 'audience.segments.type.userList.feedType.scenario',
    defaultMessage: 'Scenario',
  },
  SCENARIO_FEED: {
    id: 'audience.segments.type.userList.feedType.scenarioFeed',
    defaultMessage: 'Scenario Feed',
  },
  TAG: {
    id: 'audience.segments.type.userList.feedType.tag',
    defaultMessage: 'Tag',
  },
});

export const userQuerySegmentSubtypeMessages: {
  [key in UserQuerySegmentSubtype]: MessageDescriptor;
} = defineMessages({
  STANDARD: {
    id: 'audience.segments.subtype.STANDARD',
    defaultMessage: '(Standard)',
  },
  AB_TESTING_CONTROL_GROUP: {
    id: 'audience.segments.subtype.AB_TESTING_CONTROL_GROUP',
    defaultMessage: '(AB Testing Control Group)',
  },
  AB_TESTING_EXPERIMENT: {
    id: 'audience.segments.subtype.AB_TESTING_EXPERIMENT',
    defaultMessage: '(AB Testing Experiment)',
  },
});

const audienceSegmentPropertiesMessageMap: {
  [propertyName in keyof AudienceSegmentResource | ExtraKeys | HistoryKeys]: MessageDescriptor;
} = defineMessages({
  id: {
    id: 'audience.segments.fields.id',
    defaultMessage: 'ID',
  },
  organisation_id: {
    id: 'audience.segments.fields.organisationId',
    defaultMessage: 'Organisation ID',
  },
  name: {
    id: 'audience.segments.fields.name',
    defaultMessage: 'Audience Segment Name',
  },
  short_description: {
    id: 'audience.segments.fields.shortDescription',
    defaultMessage: 'Short Description',
  },
  technical_name: {
    id: 'audience.segments.fields.technicalName',
    defaultMessage: 'Technical Name',
  },
  default_ttl: {
    id: 'audience.segments.fields.defaultTtl',
    defaultMessage: 'Default Ttl',
  },
  datamart_id: {
    id: 'audience.segments.fields.datamartId',
    defaultMessage: 'Datamart Id',
  },
  provider_name: {
    id: 'audience.segments.fields.providerName',
    defaultMessage: 'Provider Name',
  },
  persisted: {
    id: 'audience.segments.fields.persisted',
    defaultMessage: 'Persisted',
  },
  type: {
    id: 'audience.segments.fields.type',
    defaultMessage: 'Type',
  },
  user_points_count: {
    id: 'audience.segments.fields.userPointsCount',
    defaultMessage: 'User Points Count',
  },
  user_accounts_count: {
    id: 'audience.segments.fields.userAccountsCount',
    defaultMessage: 'User Accounts Count',
  },
  emails_count: {
    id: 'audience.segments.fields.emailsCount',
    defaultMessage: 'Emails Count',
  },
  desktop_cookie_ids_count: {
    id: 'audience.segments.fields.desktopCookieIdsCount',
    defaultMessage: 'Desktop Cookie Ids Count',
  },
  mobile_cookie_ids_count: {
    id: 'audience.segments.fields.mobileCookieIdsCount',
    defaultMessage: 'Mobile Cookie Ids Count',
  },
  mobile_ad_ids_count: {
    id: 'audience.segments.fields.mobileAdIdsCount',
    defaultMessage: 'Mobile Ad Ids Count',
  },
  creation_ts: {
    id: 'audience.segments.fields.creationTs',
    defaultMessage: 'Creation Timestamp',
  },
  last_modified_ts: {
    id: 'audience.segments.fields.lastModifiedTs',
    defaultMessage: 'Last Modified Timestamp',
  },
  history_title: {
    id: 'audience.segments.resourceHistory.title',
    defaultMessage: 'Audience Segment History',
  },
  history_resource_type: {
    id: 'audience.segments.resourceHistory.type',
    defaultMessage: 'Audience Segment',
  },
  paused: {
    id: 'audience.segments.fields.paused',
    defaultMessage: 'Paused',
  },
});

const audienceSegmentPropertiesFormatMap: {
  [propertyName in keyof AudienceSegmentResource | ExtraKeys | HistoryKeys]: {
    format: ValueFormat;
    messageMap?: { [key: string]: MessageDescriptor };
  };
} = {
  id: { format: 'STRING' },
  organisation_id: { format: 'STRING' },
  name: { format: 'STRING' },
  short_description: { format: 'STRING' },
  technical_name: { format: 'STRING' },
  default_ttl: { format: 'TIMESTAMP' },
  datamart_id: { format: 'STRING' },
  provider_name: { format: 'STRING' },
  persisted: { format: 'STRING' },
  type: {
    format: 'MESSAGE',
    messageMap: audienceSegmentTypeMessages,
  },
  user_points_count: { format: 'INTEGER' },
  user_accounts_count: { format: 'INTEGER' },
  emails_count: { format: 'INTEGER' },
  desktop_cookie_ids_count: { format: 'INTEGER' },
  mobile_cookie_ids_count: { format: 'INTEGER' },
  mobile_ad_ids_count: { format: 'INTEGER' },
  creation_ts: { format: 'TIMESTAMP' },
  last_modified_ts: { format: 'TIMESTAMP' },
  history_title: { format: 'STRING' },
  history_resource_type: { format: 'STRING' },
  paused: { format: 'STRING' },
};

export const formatAudienceSegmentProperty = (
  property: keyof AudienceSegmentResource | HistoryKeys,
  value?: string,
): {
  message: MessageDescriptor;
  formattedValue?: React.ReactNode;
} => {
  return {
    message: audienceSegmentPropertiesMessageMap[property],
    formattedValue:
      value && audienceSegmentPropertiesFormatMap[property]
        ? formatToFormattingFunction(
            value,
            audienceSegmentPropertiesFormatMap[property].format,
            audienceSegmentPropertiesFormatMap[property].messageMap,
          )
        : undefined,
  };
};

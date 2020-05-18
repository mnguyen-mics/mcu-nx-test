import { defineMessages } from 'react-intl';

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
    defaultMessage:
      'An unexpected error happened running your overlap. Please retry.',
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
  lookAlikeModalNameLabel: {
    id: 'audience.segments.lookalike.modal.name.label',
    defaultMessage: 'Segment Name',
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
    defaultMessage: 'Choose between the two following lookalike types',
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
    defaultMessage: 'An extension factor of N means that the N most overlapping partitions will be added to your base segment.',
  },
  extensionFactorError: {
    id: 'audience.segments.lookalikeCreation.extension.error',
    defaultMessage: 'Select a partition before choosing an extension factor.',
  },
  seeToControlGroupDashboard: {
    id: 'audience.segments.ABComparisonDashboard.controlGroupDashboardButton',
    defaultMessage: 'See Control Group Dashboard',
  },
});

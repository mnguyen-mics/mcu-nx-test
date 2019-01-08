import { defineMessages } from 'react-intl';

export default defineMessages({
  // Segment
  audienceSegment: {
    id: 'segment',
    defaultMessage: 'Segments',
  },
  userPoints: {
    id: 'segment.user_points',
    defaultMessage: 'User Points',
  },
  userAccounts: {
    id: 'segment.user_accounts',
    defaultMessage: 'Accounts',
  },
  emails: {
    id: 'segment.emails',
    defaultMessage: 'Emails',
  },
  desktopCookieId: {
    id: 'segment.desktop_cookie_ids',
    defaultMessage: 'Display Cookies',
  },
  userPointAddition: {
    id: 'segment.user_point_additions',
    defaultMessage: 'User Point Additions',
  },
  userPointDeletion: {
    id: 'segment.user_point_deletions',
    defaultMessage: 'User Point Deletions'
  },
  // Overlap
  overlap: {
    id: 'segment.overlap',
    defaultMessage: 'Audience Segment Overlap'
  },
  overlapNumber: {
    id: 'segment.overlap_number',
    defaultMessage: 'Overlap Number'
  },
  modalOverlapContentMessage: {
    id: 'segment.overlap.modal.content',
    defaultMessage: 'By clicking on OK you will create an overlap of the selected segment. Be carefull, this operation can take a significant amount of time.',
  },
  modalOverlapContentTitle: {
    id: 'segment.overlap.modal.title',
    defaultMessage: 'Create an Overlap Analysis',
  },
  generated: {
    id: 'segment.overlap.time.generated',
    defaultMessage: 'Generated',
  },
  refresh: {
    id: 'segment.overlap.button.refresh',
    defaultMessage: 'Refresh',
  },
  createOverlap: {
    id: 'segment.overlap.button.create',
    defaultMessage: 'Create Overlap Analysis'
  },
  lookAlikeCreation: {
    id: 'segment.lookalike.button.create',
    defaultMessage: 'Create Lookalike'
  },
  lookAlikeModalTitle: {
    id: 'segment.lookalike.modal.title',
    defaultMessage: 'Create Lookalike'
  },
  lookAlikeModalHelper: {
    id: 'segment.lookalike.modal.helper',
    defaultMessage: 'To create a Lookalike, please select a partition and your extension ratio. Your segment will then be overlapped against the partition selected and the most overlapping partitions will be added to your base segment.'
  },
  lookAlikeModalNameLabel: {
    id: 'segment.lookalike.modal.name.label',
    defaultMessage: 'Segment Name'
  },
  lookAlikeModalPartitionLabel: {
    id: 'segment.lookalike.modal.partition.label',
    defaultMessage: 'Partition'
  },
  lookAlikeModalExtentionFactorLabel: {
    id: 'segment.lookalike.modal.extensionFactor.label',
    defaultMessage: 'Extension Factor'
  },
  lookAlikeCalibrationExecution: {
    id: 'segment.lookalike.button.calibration.execution',
    defaultMessage: 'Calibrate'
  },
  lookAlikeCalibrationRunning: {
    id: 'segment.lookalike.button.calibration.executing',
    defaultMessage: 'Calibration Ongoing'
  },
  lookAlikeCalibrationErrorSuccess: {
    id: 'segment.lookalike.button.calibration.done',
    defaultMessage: 'Recalibrate'
  },
  USER_POINT_ADDITIONS: {
    id: 'segment.additiondeletions.userpointaddition.label',
    defaultMessage: 'Userpoint Additions'
  },
  USER_POINT_DELETIONS: {
    id: 'segment.additiondeletions.userpointdeletion.label',
    defaultMessage: 'Userpoint Deletions'
  },
  noAdditionDeletion: {
    id: 'segment.additiondeletions.nodata',
    defaultMessage: 'There is no data on the selected period!'
  },
});

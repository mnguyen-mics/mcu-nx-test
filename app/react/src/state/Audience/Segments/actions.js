import { createAction } from '../../../utils/ReduxHelper';

import {
  AUDIENCE_SEGMENTS_LOAD_ALL,
  AUDIENCE_SEGMENTS_LIST_FETCH,
  AUDIENCE_SEGMENTS_PERFORMANCE_REPORT_FETCH,
  AUDIENCE_SEGMENTS_TABLE_RESET,
  AUDIENCE_SEGMENT_SINGLE_LOAD_ALL,
  AUDIENCE_SEGMENT_SINGLE_FETCH,
  AUDIENCE_SEGMENT_SINGLE_PERFORMANCE_REPORT_FETCH,
  AUDIENCE_SEGMENT_SINGLE_RESET,
  AUDIENCE_SEGMENT_CREATE_OVERLAP,
  AUDIENCE_SEGMENT_RETRIEVE_OVERLAP
} from '../../action-types';

// ACTIONS FOR LIST
const resetAudienceSegmentsTable = createAction(AUDIENCE_SEGMENTS_TABLE_RESET);

const fetchAudienceSegmentList = {
  request: (organisationId, datamartId, filter = {}) => createAction(AUDIENCE_SEGMENTS_LIST_FETCH.REQUEST)({ organisationId, datamartId, filter }),
  success: (response) => createAction(AUDIENCE_SEGMENTS_LIST_FETCH.SUCCESS)(response),
  failure: (error) => createAction(AUDIENCE_SEGMENTS_LIST_FETCH.FAILURE)(error)
};

const fetchAudienceSegmentsPerformanceReport = {
  request: (organisationId, filter = {}) => createAction(AUDIENCE_SEGMENTS_PERFORMANCE_REPORT_FETCH.REQUEST)({ organisationId, filter }),
  success: (response) => createAction(AUDIENCE_SEGMENTS_PERFORMANCE_REPORT_FETCH.SUCCESS)(response),
  failure: (error) => createAction(AUDIENCE_SEGMENTS_PERFORMANCE_REPORT_FETCH.FAILURE)(error)
};

const loadAudienceSegmentsDataSource = (organisationId, datamartId, filter, isInitialRender = false) => createAction(AUDIENCE_SEGMENTS_LOAD_ALL)({ organisationId, datamartId, filter, isInitialRender });

// ACTIONS FOR DASHBOARD VIEW
const resetAudienceSegmentSingle = createAction(AUDIENCE_SEGMENT_SINGLE_RESET);

const fetchAudienceSegmentSingle = {
  request: (organisationId, datamartId, filter = {}) => createAction(AUDIENCE_SEGMENT_SINGLE_FETCH.REQUEST)({ organisationId, datamartId, filter }),
  success: (response) => createAction(AUDIENCE_SEGMENT_SINGLE_FETCH.SUCCESS)(response),
  failure: (error) => createAction(AUDIENCE_SEGMENT_SINGLE_FETCH.FAILURE)(error)
};

const fetchAudienceSegmentSinglePerformanceReport = {
  request: (organisationId, filter = {}) => createAction(AUDIENCE_SEGMENT_SINGLE_PERFORMANCE_REPORT_FETCH.REQUEST)({ organisationId, filter }),
  success: (response) => createAction(AUDIENCE_SEGMENT_SINGLE_PERFORMANCE_REPORT_FETCH.SUCCESS)(response),
  failure: (error) => createAction(AUDIENCE_SEGMENT_SINGLE_PERFORMANCE_REPORT_FETCH.FAILURE)(error)
};

const loadAudienceSegmentSingleDataSource = (segmentId, organisationId, filter, isInitialRender = false) => createAction(AUDIENCE_SEGMENT_SINGLE_LOAD_ALL)({ segmentId, organisationId, filter, isInitialRender });

const createAudienceSegmentOverlap = {
  request: (datamartId, segmentId, filter = {}) => createAction(AUDIENCE_SEGMENT_CREATE_OVERLAP.REQUEST)({ datamartId, segmentId, filter }),
  success: (response) => createAction(AUDIENCE_SEGMENT_CREATE_OVERLAP.SUCCESS)(response),
  failure: (error) => createAction(AUDIENCE_SEGMENT_CREATE_OVERLAP.FAILURE)(error)
};

const fetchAudienceSegmentOverlap = {
  request: (segmentId, organisationId, datamartId, filter = {}) => createAction(AUDIENCE_SEGMENT_RETRIEVE_OVERLAP.REQUEST)({ segmentId, organisationId, datamartId, filter }),
  success: (response) => createAction(AUDIENCE_SEGMENT_RETRIEVE_OVERLAP.SUCCESS)(response),
  failure: (error) => createAction(AUDIENCE_SEGMENT_RETRIEVE_OVERLAP.FAILURE)(error)
};

export {
  fetchAudienceSegmentList,
  fetchAudienceSegmentsPerformanceReport,
  loadAudienceSegmentsDataSource,
  resetAudienceSegmentsTable,
  resetAudienceSegmentSingle,
  fetchAudienceSegmentSingle,
  fetchAudienceSegmentSinglePerformanceReport,
  loadAudienceSegmentSingleDataSource,
  createAudienceSegmentOverlap,
  fetchAudienceSegmentOverlap
};

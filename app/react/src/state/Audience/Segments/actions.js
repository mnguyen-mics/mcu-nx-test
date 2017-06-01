import { createAction } from '../../../utils/ReduxHelper';

import {
  AUDIENCE_SEGMENTS_LOAD_ALL,
  AUDIENCE_SEGMENTS_LIST_FETCH,
  AUDIENCE_SEGMENTS_PERFORMANCE_REPORT_FETCH,
  AUDIENCE_SEGMENTS_TABLE_RESET
} from '../../action-types';

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

export {
  fetchAudienceSegmentList,
  fetchAudienceSegmentsPerformanceReport,
  loadAudienceSegmentsDataSource,
  resetAudienceSegmentsTable
};

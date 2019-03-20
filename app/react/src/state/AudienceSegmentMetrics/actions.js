import { createAction } from 'redux-actions';

import {
  STORE_AUDIENCE_SEGMENT_METRICS,
  AUDIENCE_SEGMENT_METRICS,
  ALL_AUDIENCE_SEGMENT_METRICS,
} from '../action-types';

const setAudienceSegmentMetrics = payload => {
  createAction(STORE_AUDIENCE_SEGMENT_METRICS)(payload);
};

const fetchAudienceSegmentMetrics = {
  request: () => createAction(AUDIENCE_SEGMENT_METRICS.REQUEST)(),
  success: response => createAction(AUDIENCE_SEGMENT_METRICS.SUCCESS)(response),
  failure: error => createAction(AUDIENCE_SEGMENT_METRICS.FAILURE)(error),
};

const fetchAllAudienceSegmentMetrics = {
  request: (orgId) => createAction(ALL_AUDIENCE_SEGMENT_METRICS.REQUEST)(orgId),
  success: response => createAction(STORE_AUDIENCE_SEGMENT_METRICS)(response),
  failure: error => createAction(ALL_AUDIENCE_SEGMENT_METRICS.FAILURE)(error),
};

export {
  setAudienceSegmentMetrics,
  fetchAudienceSegmentMetrics,
  fetchAllAudienceSegmentMetrics,
};

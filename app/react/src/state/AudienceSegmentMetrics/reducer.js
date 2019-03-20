import { STORE_AUDIENCE_SEGMENT_METRICS } from '../action-types';

const metrics = (
  state = {
    audienceSegmentMetrics: [],
  },
  action,
) => {
  switch (action.type) {
    case STORE_AUDIENCE_SEGMENT_METRICS:
      return {
        ...state,
        audienceSegmentMetrics: action.payload,
      };
    default:
      return state;
  }
};

const AudienceSegmentMetricsReducer = {
  metrics,
};

export default AudienceSegmentMetricsReducer;

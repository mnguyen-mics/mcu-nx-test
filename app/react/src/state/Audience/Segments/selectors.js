import { createSelector } from 'reselect';

import { normalizeReportView } from '../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../utils/Normalizer';

const getAudienceSegments = state => state.audienceSegmentsTable.audienceSegmentsApi.data;
const getPerformanceReportView = state => state.audienceSegmentsTable.performanceReportApi.report_view;

const getAudienceSegmentsById = createSelector(
  getAudienceSegments,
  audienceSegments => normalizeArrayOfObject(audienceSegments, 'id')
);

const convertPerformanceReportToObjectArray = createSelector(
  getPerformanceReportView,
  (reportView) => normalizeReportView(reportView)
);

const getStatBySegmentId = createSelector(
  convertPerformanceReportToObjectArray,
  (array) => normalizeArrayOfObject(array, 'audience_segment_id')
);

const getTableDataSource = createSelector(
  getAudienceSegmentsById,
  getStatBySegmentId,
  (audienceSegments, statistics) => {
    return Object.keys(audienceSegments).map((segmentId) => {
      return {
        ...statistics[segmentId],
        ...audienceSegments[segmentId]
      };
    });
  }
);

export {
  getTableDataSource
};

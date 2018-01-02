import { createSelector } from 'reselect';

import { normalizeReportView } from '../../../utils/MetricHelper.ts';
import { normalizeArrayOfObject } from '../../../utils/Normalizer.ts';

const getAudienceSegments = state => state.audienceSegmentsTable.audienceSegmentsApi.data;
const getPerformanceReportView = state => state.audienceSegmentsTable.performanceReportApi.report_view;
const getAudienceSegmentSinglePerformance = state => state.audienceSegmentsTable.performanceReportSingleApi.report_view;
const getOverlapAnalysis = state => state.audienceSegmentsTable.overlapAnalysisApi.data;
const getSingleSegment = state => state.audienceSegmentsTable.audienceSegmentsSingleApi.audienceSegment;

const getAudienceSegmentsById = createSelector(
  getAudienceSegments,
  audienceSegments => normalizeArrayOfObject(audienceSegments, 'id'),
);

const convertPerformanceReportToObjectArray = createSelector(
  getPerformanceReportView,
  (reportView) => normalizeReportView(reportView),
);

const getStatBySegmentId = createSelector(
  convertPerformanceReportToObjectArray,
  (array) => normalizeArrayOfObject(array, 'audience_segment_id'),
);

const getTableDataSource = createSelector(
  getAudienceSegmentsById,
  getStatBySegmentId,
  (audienceSegments, statistics) => {
    return Object.keys(audienceSegments).map((segmentId) => {
      return {
        ...statistics[segmentId],
        ...audienceSegments[segmentId],
      };
    });
  },
);

const getAudienceSegmentPerformance = createSelector(
  getAudienceSegmentSinglePerformance,
  (array) => normalizeReportView(array),
);

const getOverlapFormatted = createSelector(
  getOverlapAnalysis,
  getSingleSegment,
  (data, segmentSource) => {
    if (data.length === 0) {
      return { date: 0, data: [] };
    }
    // we get the segment source data in order to have access to segment source size
    const source = data.segments.find(segment => segment.segment_id.toString() === segmentSource.id);
    const formattedData = data.overlaps.map(overlap => {
      return {
        xKey: data.segments.find(segment => {
          return segment.segment_id === overlap.segment_intersect_with;
        }).name,
        yKey: (overlap.overlap_number / source.segment_size) * 100,
        segment_source: {
          id: overlap.segment_source_id,
          number: source.segment_size,
        },
        overlap_number: {
          number: overlap.overlap_number,
          percentage: (overlap.overlap_number / source.segment_size) * 100,
        },
        segment_intersect_with: {
          id: overlap.segment_intersect_with,
          number: source.segment_size,
        },
      };
    });
    return {
      date: data.date,
      data: formattedData
    };
  },
);

const getOverlapView = createSelector(
  getOverlapFormatted,
  (overlap) => {
    return {
      ...overlap
    };
  },
);

export {
  getTableDataSource,
  getAudienceSegmentPerformance,
  getOverlapView,
};

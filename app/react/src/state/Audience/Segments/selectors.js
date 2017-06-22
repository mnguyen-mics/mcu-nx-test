import { createSelector } from 'reselect';

import { normalizeReportView } from '../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../utils/Normalizer';

const getAudienceSegments = state => state.audienceSegmentsTable.audienceSegmentsApi.data;
const getPerformanceReportView = state => state.audienceSegmentsTable.performanceReportApi.report_view;
const getAudienceSegmentSinglePerformance = state => state.audienceSegmentsTable.performanceReportSingleApi.report_view;
const getOverlapAnalysis = state => state.audienceSegmentsTable.overlapAnalysisApi.data;

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

const getSinglePerfView = createSelector(
  getAudienceSegmentSinglePerformance,
  (array) => normalizeReportView(array)
);

const getOverlapFormated = createSelector(
  getOverlapAnalysis,
  (data) => {
    if (data.length === 0) {
      return { date: 0, data: [] };
    }
    const formatedData = data.overlaps.map(overlap => {
      const source = data.segments.find((segment) => {
        return segment.segment_id === overlap.segment_source_id;
      });
      const intersect = data.segments.find((segment) => {
        return segment.segment_id === overlap.segment_intersect_with;
      });
      const returnFormat = {
        xKey: overlap.segment_intersect_with,
        yKey: (overlap.overlap_number / source.segment_size) * 100,
        segment_source: {
          id: overlap.segment_source_id,
          number: source.segment_size
        },
        overlap_number: {
          number: overlap.overlap_number,
          percentage: (overlap.overlap_number / source.segment_size) * 100
        },
        segment_intersect_with: {
          id: overlap.segment_intersect_with,
          number: source.segment_size
        }
      };
      return returnFormat;
    });
    return {
      date: data.date,
      data: formatedData
    };
  }
);

const getOverlapSorted = createSelector(
  getOverlapFormated,
  (data) => {
    const sortedData = data.data.sort((a, b) => {
      return a.overlap_number.percentage > b.overlap_number.percentage ? -1 : 1;
    });
    return {
      ...data,
      data: sortedData
    };
  }
);

const getOverlapView = createSelector(
  getOverlapSorted,
  getAudienceSegments,
  (overlap, segment) => {
    const data = overlap.data.map(o => {
      const se = segment.find(s => {
        return s.id.toString() === o.segment_intersect_with.id.toString();
      });
      const xKey = se ? se.name : o.segment_intersect_with.id;
      const ret = {
        ...o,
        xKey: xKey
      };
      return ret;
    });
    return {
      ...overlap,
      data: data
    };
  }
);

export {
  getTableDataSource,
  getSinglePerfView,
  getOverlapView
};

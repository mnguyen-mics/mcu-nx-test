import { createSelector } from 'reselect';

const getAudienceSegments = state => state.audienceSegmentsTable.audienceSegmentsApi.data;
const getPerformanceReportRows = state => state.audienceSegmentsTable.performanceReportApi.report_view.rows;
const getPerformanceReportHeaders = state => state.audienceSegmentsTable.performanceReportApi.report_view.columns_headers;

const getAudienceSegmentsById = createSelector(
  getAudienceSegments,
  audienceSegments => audienceSegments.reduce((acc, audienceSegment) => {
    acc[audienceSegment.id] = audienceSegment; // eslint-disable-line no-param-reassign
    return acc;
  }, {})
);

const convertPerformanceReportToObjectArray = createSelector(
  getPerformanceReportHeaders,
  getPerformanceReportRows,
  (headers, rows) => rows.map(row => {
    return headers.reduce((acc, header, index) => {
      acc[header] = row[index]; // eslint-disable-line no-param-reassign
      return acc;
    }, {});
  })
);

const getStatBySegmentId = createSelector(
  convertPerformanceReportToObjectArray,
  (array) => array.reduce((acc, reportObject) => {
    acc[reportObject.audience_segment_id] = reportObject; // eslint-disable-line no-param-reassign
    return acc;
  }, {})
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

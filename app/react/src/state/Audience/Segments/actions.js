import { CALL_API } from '../../../middleware/api';

import {
  AUDIENCE_SEGMENTS_FETCH_REQUEST,
  AUDIENCE_SEGMENTS_FETCH_REQUEST_FAILURE,
  AUDIENCE_SEGMENTS_FETCH_REQUEST_SUCCESS,

  AUDIENCE_SEGMENTS_PERFORMANCE_REPORT_FETCH_REQUEST,
  AUDIENCE_SEGMENTS_PERFORMANCE_REPORT_FETCH_REQUEST_FAILURE,
  AUDIENCE_SEGMENTS_PERFORMANCE_REPORT_FETCH_REQUEST_SUCCESS,

  AUDIENCE_SEGMENTS_TABLE_RESET
} from '../../action-types';

const resetAudienceSegmentsTable = () => ({
  type: AUDIENCE_SEGMENTS_TABLE_RESET
});

const fetchAudienceSegments = filter => (dispatch, getState) => { // eslint-disable-line consistent-return
  const {
    audienceSegmentsTable: {
      audienceSegmentsApi: {
        isFetching
      }
    },
    sessionState: {
      activeWorkspace: {
        organisationId,
        datamartId
      }
    }
  } = getState();

  if (isFetching) {
    return Promise.resolve();
  }

  const params = {
    organisation_id: organisationId,
    datamart_id: datamartId,
    first_result: (filter.currentPage - 1) * filter.pageSize,
    max_results: filter.pageSize,
  };

  if (filter.keywords) { params.name = filter.keywords; }
  if (filter.types) { params.types = filter.types; }

  return dispatch({
    [CALL_API]: {
      method: 'get',
      endpoint: 'audience_segments',
      params,
      authenticated: true,
      types: [AUDIENCE_SEGMENTS_FETCH_REQUEST, AUDIENCE_SEGMENTS_FETCH_REQUEST_FAILURE, AUDIENCE_SEGMENTS_FETCH_REQUEST_SUCCESS]
    }
  });
};

const fetchAudienceSegmentsPerformanceReport = filter => (dispatch, getState) => { // eslint-disable-line consistent-return
  const {
    audienceSegmentsTable: {
      performanceReportApi: {
        isFetching
      }
    },
    sessionState: {
      activeWorkspace: {
        organisationId
      }
    }
  } = getState();

  const DATE_FORMAT = 'YYYY-MM-DD';

  // if (isFetching) {
    // return Promise.resolve();
  // }

  const params = {
    organisation_id: organisationId,
    start_date: filter.from.format(DATE_FORMAT),
    end_date: filter.to.format(DATE_FORMAT),
    dimension: 'audience_segment_id',
    filters: `organisation_id==${organisationId}`,
    metrics: ['user_points', 'user_accounts', 'emails,desktop_cookie_ids', 'user_point_additions', 'user_point_deletions']
  };

  return dispatch({
    [CALL_API]: {
      method: 'get',
      endpoint: 'reports/audience_segment_report',
      params,
      authenticated: true,
      types: [AUDIENCE_SEGMENTS_PERFORMANCE_REPORT_FETCH_REQUEST, AUDIENCE_SEGMENTS_PERFORMANCE_REPORT_FETCH_REQUEST_FAILURE, AUDIENCE_SEGMENTS_PERFORMANCE_REPORT_FETCH_REQUEST_SUCCESS]
    }
  });
};

/*
const deleteAudienceSegments = (id) => {
  return (dispatch, getState) => { // eslint-disable-line consistent-return

    const { audienceSegmentsState } = getState();

    if (!audienceSegmentsState.isDeleting) {
      return dispatch({
        [CALL_API]: {
          method: 'delete',
          endpoint: `audience_segments/${id}`,
          authenticated: true,
          types: [AUDIENCE_SEGMENTS_DELETE_REQUEST, AUDIENCE_SEGMENTS_DELETE_REQUEST_FAILURE, AUDIENCE_SEGMENTS_DELETE_REQUEST_SUCCESS]
        }
      });
    }
  };
};
*/

const fetchSegmentsAndStatistics = filter => dispatch => {
  // return dispatch(fetchCampaignsEmail(filter));
  return Promise.all([
    dispatch(fetchAudienceSegments(filter)),
    dispatch(fetchAudienceSegmentsPerformanceReport(filter))
  ]);
};

export {
  fetchAudienceSegments,
  fetchAudienceSegmentsPerformanceReport,
  fetchSegmentsAndStatistics,
  resetAudienceSegmentsTable
};

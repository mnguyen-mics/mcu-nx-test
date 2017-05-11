import { CALL_API } from '../../../middleware/api';

import {
  // CAMPAIGNS_DISPLAY_DELETE_REQUEST,
  // CAMPAIGNS_DISPLAY_DELETE_REQUEST_FAILURE,
  // CAMPAIGNS_DISPLAY_DELETE_REQUEST_SUCCESS,

  CAMPAIGNS_DISPLAY_FETCH_REQUEST,
  CAMPAIGNS_DISPLAY_FETCH_REQUEST_FAILURE,
  CAMPAIGNS_DISPLAY_FETCH_REQUEST_SUCCESS,

  CAMPAIGNS_DISPLAY_PERFORMANCE_REPORT_FETCH_REQUEST,
  CAMPAIGNS_DISPLAY_PERFORMANCE_REPORT_FETCH_REQUEST_FAILURE,
  CAMPAIGNS_DISPLAY_PERFORMANCE_REPORT_FETCH_REQUEST_SUCCESS,

  CAMPAIGNS_DISPLAY_TABLE_RESET
} from '../../action-types';

const resetCampaignsDisplayTable = () => ({
  type: CAMPAIGNS_DISPLAY_TABLE_RESET
});

const fetchCampaignsDisplay = filter => (dispatch, getState) => { // eslint-disable-line consistent-return
  const {
    campaignsDisplayTable: {
      campaignsDisplayApi: {
        isFetching
      }
    },
    sessionState: {
      activeWorkspace: {
        organisationId
      }
    }
  } = getState();

  if (isFetching) {
    return Promise.resolve();
  }

  const params = {
    organisation_id: organisationId,
    campaign_type: 'DISPLAY',
    first_result: (filter.currentPage - 1) * filter.pageSize,
    max_results: filter.pageSize,
    archived: filter.statuses.includes('ARCHIVED')
  };

  const apiStatuses = filter.statuses.filter(status => status !== 'ARCHIVED');

  if (filter.keywords) { params.keywords = filter.keywords; }
  if (apiStatuses.length > 0) {
    params.status = apiStatuses;
  }

  return dispatch({
    [CALL_API]: {
      method: 'get',
      endpoint: 'campaigns',
      params,
      authenticated: true,
      types: [CAMPAIGNS_DISPLAY_FETCH_REQUEST, CAMPAIGNS_DISPLAY_FETCH_REQUEST_FAILURE, CAMPAIGNS_DISPLAY_FETCH_REQUEST_SUCCESS]
    }
  });
};

const fetchCampaignsDisplayPerformanceReport = filter => (dispatch, getState) => { // eslint-disable-line consistent-return
  const {
    campaignsDisplayTable: {
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
    dimension: '',
    filters: `organisation_id==${organisationId}`,
    metrics: ['impressions', 'clicks', 'cpm', 'ctr', 'cpc', 'impressions_cost', 'cpa']
  };

  return dispatch({
    [CALL_API]: {
      method: 'get',
      endpoint: 'reports/display_campaign_performance_report',
      params,
      authenticated: true,
      types: [CAMPAIGNS_DISPLAY_PERFORMANCE_REPORT_FETCH_REQUEST, CAMPAIGNS_DISPLAY_PERFORMANCE_REPORT_FETCH_REQUEST_FAILURE, CAMPAIGNS_DISPLAY_PERFORMANCE_REPORT_FETCH_REQUEST_SUCCESS]
    }
  });
};

// const deleteCampaignsDisplay = (id) => {
//   return (dispatch, getState) => { // eslint-disable-line consistent-return

//     const { campaignsDisplayState } = getState();

//     if (!campaignsDisplayState.isDeleting) {
//       return dispatch({
//         [CALL_API]: {
//           method: 'delete',
//           endpoint: `display_campaigns/${id}`,
//           authenticated: true,
//           types: [CAMPAIGNS_DISPLAY_DELETE_REQUEST, CAMPAIGNS_DISPLAY_DELETE_REQUEST_FAILURE, CAMPAIGNS_DISPLAY_DELETE_REQUEST_SUCCESS]
//         }
//       });
//     }
//   };
// };

const fetchCampaignsAndStatistics = filter => dispatch => {
  // return dispatch(fetchCampaignsEmail(filter));
  return Promise.all([
    dispatch(fetchCampaignsDisplay(filter)),
    dispatch(fetchCampaignsDisplayPerformanceReport(filter))
  ]);
};

export {
  fetchCampaignsDisplay,
  fetchCampaignsDisplayPerformanceReport,
  fetchCampaignsAndStatistics,
  resetCampaignsDisplayTable
};

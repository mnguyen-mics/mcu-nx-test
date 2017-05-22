import { CALL_API } from '../../middleware/api';

import {
  // AUTOMATIONS_LIST_DELETE_REQUEST,
  // AUTOMATIONS_LIST_DELETE_REQUEST_FAILURE,
  // AUTOMATIONS_LIST_DELETE_REQUEST_SUCCESS,

  AUTOMATIONS_LIST_FETCH_REQUEST,
  AUTOMATIONS_LIST_FETCH_REQUEST_FAILURE,
  AUTOMATIONS_LIST_FETCH_REQUEST_SUCCESS,

//   AUTOMATIONS_LIST_PERFORMANCE_REPORT_FETCH_REQUEST,
//   AUTOMATIONS_LIST_PERFORMANCE_REPORT_FETCH_REQUEST_FAILURE,
//   AUTOMATIONS_LIST_PERFORMANCE_REPORT_FETCH_REQUEST_SUCCESS,

  AUTOMATIONS_LIST_TABLE_RESET
} from '../action-types';

const resetAutomationsTable = () => ({
  type: AUTOMATIONS_LIST_TABLE_RESET
});

const fetchAutomations = filter => (dispatch, getState) => { // eslint-disable-line consistent-return
  const {
    automationsTable: {
      automationsApi: {
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
    first_result: (filter.currentPage - 1) * filter.pageSize,
    max_results: filter.pageSize,
  };

  return dispatch({
    [CALL_API]: {
      method: 'get',
      endpoint: 'scenarios',
      params,
      authenticated: true,
      types: [AUTOMATIONS_LIST_FETCH_REQUEST, AUTOMATIONS_LIST_FETCH_REQUEST_FAILURE, AUTOMATIONS_LIST_FETCH_REQUEST_SUCCESS]
    }
  });
};

// const fetchAutomationsPerformanceReport = filter => (dispatch, getState) => { // eslint-disable-line consistent-return
//   const {
//     automationsTable: {
//       performanceReportApi: {
//         isFetching
//       }
//     },
//     sessionState: {
//       activeWorkspace: {
//         organisationId
//       }
//     }
//   } = getState();

//   const DATE_FORMAT = 'YYYY-MM-DD';

//   if (isFetching) {
//     return Promise.resolve();
//   }

//   const params = {
//     organisation_id: organisationId,
//     start_date: filter.from.format(DATE_FORMAT),
//     end_date: filter.to.format(DATE_FORMAT),
//     dimension: '',
//     filters: `organisation_id==${organisationId}`,
//     metrics: ['impressions', 'clicks', 'cpm', 'ctr', 'cpc', 'impressions_cost', 'cpa']
//   };

//   return dispatch({
//     [CALL_API]: {
//       method: 'get',
//       endpoint: 'reports/display_campaign_performance_report',
//       params,
//       authenticated: true,
//       types: [AUTOMATIONS_LIST_PERFORMANCE_REPORT_FETCH_REQUEST, AUTOMATIONS_LIST_PERFORMANCE_REPORT_FETCH_REQUEST_FAILURE, AUTOMATIONS_LIST_PERFORMANCE_REPORT_FETCH_REQUEST_SUCCESS]
//     }
//   });
// };

// const deleteAutomations = (id) => {
//   return (dispatch, getState) => { // eslint-disable-line consistent-return

//     const { automationsState } = getState();

//     if (!automationsState.isDeleting) {
//       return dispatch({
//         [CALL_API]: {
//           method: 'delete',
//           endpoint: `display_campaigns/${id}`,
//           authenticated: true,
//           types: [AUTOMATIONS_LIST_DELETE_REQUEST, AUTOMATIONS_LIST_DELETE_REQUEST_FAILURE, AUTOMATIONS_LIST_DELETE_REQUEST_SUCCESS]
//         }
//       });
//     }
//   };
// };

const fetchAutomationsAndStatistics = filter => dispatch => {
  // return dispatch(fetchCampaignsEmail(filter));
  return Promise.all([
    dispatch(fetchAutomations(filter)),
    // dispatch(fetchAutomationsPerformanceReport(filter))
  ]);
};

export {
  fetchAutomations,
//   fetchAutomationsPerformanceReport,
  fetchAutomationsAndStatistics,
  resetAutomationsTable
};

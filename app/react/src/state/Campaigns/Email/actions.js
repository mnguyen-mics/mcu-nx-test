import { CALL_API } from '../../../middleware/api';

import {
  // CAMPAIGNS_EMAIL_DELETE_REQUEST,
  // CAMPAIGNS_EMAIL_DELETE_REQUEST_FAILURE,
  // CAMPAIGNS_EMAIL_DELETE_REQUEST_SUCCESS,
  CAMPAIGNS_EMAIL_DELIVERY_REPORT_FETCH_REQUEST,
  CAMPAIGNS_EMAIL_DELIVERY_REPORT_FETCH_REQUEST_FAILURE,
  CAMPAIGNS_EMAIL_DELIVERY_REPORT_FETCH_REQUEST_SUCCESS,

  CAMPAIGNS_EMAIL_FETCH_REQUEST,
  CAMPAIGNS_EMAIL_FETCH_REQUEST_FAILURE,
  CAMPAIGNS_EMAIL_FETCH_REQUEST_SUCCESS,
  CAMPAIGNS_EMAIL_TABLE_RESET
} from '../../action-types';

const resetCampaignsEmailTable = () => dipatch => {
  return dipatch({
    type: CAMPAIGNS_EMAIL_TABLE_RESET
  });
};

const fetchCampaignsEmail = filter => (dispatch, getState) => { // eslint-disable-line consistent-return
  const {
    campaignsEmailTable: {
      campaignsEmailApi: {
        isFetching
      }
    },
    sessionState: {
      activeWorkspace: {
        organisationId
      }
    }
  } = getState();

  /*
  if (isFetching) {
    return Promise.resolve();
  }
  */

  const params = {
    organisation_id: organisationId,
    campaign_type: 'EMAIL',
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
      types: [CAMPAIGNS_EMAIL_FETCH_REQUEST, CAMPAIGNS_EMAIL_FETCH_REQUEST_FAILURE, CAMPAIGNS_EMAIL_FETCH_REQUEST_SUCCESS]
    }
  });
};

const fetchCampaignsEmailDeliveryReport = filter => (dispatch, getState) => {

  const {
    campaignsEmailTable: {
      deliveryReportApi: {
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

  if (isFetching) {
    return Promise.resolve();
  }

  const params = {
    organisation_id: organisationId,
    start_date: filter.from.format(DATE_FORMAT),
    end_date: filter.to.format(DATE_FORMAT),
    dimension: 'campaign_id',
    metrics: ['email_sent', 'email_hard_bounced', 'email_soft_bounced', 'clicks', 'impressions'].join(',')
  };

  // TODO  allow custom metrics retrieval
  // if (filter.metrics) { params.metrics = filter.cols; }

  return dispatch({
    [CALL_API]: {
      method: 'get',
      endpoint: 'reports/delivery_report',
      params,
      authenticated: true,
      types: [CAMPAIGNS_EMAIL_DELIVERY_REPORT_FETCH_REQUEST, CAMPAIGNS_EMAIL_DELIVERY_REPORT_FETCH_REQUEST_FAILURE, CAMPAIGNS_EMAIL_DELIVERY_REPORT_FETCH_REQUEST_SUCCESS]
    }
  });
};

const fetchCampaignsAndStatistics = filter => dispatch => {
  // return dispatch(fetchCampaignsEmail(filter));
  return Promise.all([
    dispatch(fetchCampaignsEmail(filter)),
    dispatch(fetchCampaignsEmailDeliveryReport(filter))
  ]);
};

// const deleteCampaignsEmail = (id) => {
//   return (dispatch, getState) => { // eslint-disable-line consistent-return

//     const { campaignsEmailState } = getState();

//     if (!campaignsEmailState.isDeleting) {
//       return dispatch({
//         [CALL_API]: {
//           method: 'delete',
//           endpoint: `email_campaigns/${id}`,
//           authenticated: true,
//           types: [CAMPAIGNS_EMAIL_DELETE_REQUEST, CAMPAIGNS_EMAIL_DELETE_REQUEST_FAILURE, CAMPAIGNS_EMAIL_DELETE_REQUEST_SUCCESS]
//         }
//       });
//     }
//   };
// };

export {
  fetchCampaignsEmail,
  fetchCampaignsEmailDeliveryReport,
  fetchCampaignsAndStatistics,
  resetCampaignsEmailTable
};

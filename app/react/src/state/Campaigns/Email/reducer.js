import { combineReducers } from 'redux';

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

const defaultCampaignsEmailApiState = {
  isFetching: false,
  data: [],
  total: 0
};
const campaignsEmailApi = (state = defaultCampaignsEmailApiState, action) => {
  switch (action.type) {
    case CAMPAIGNS_EMAIL_FETCH_REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case CAMPAIGNS_EMAIL_FETCH_REQUEST_SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.response
      };
    case CAMPAIGNS_EMAIL_FETCH_REQUEST_FAILURE:
      return {
        ...state,
        isFetching: false
      };
    case CAMPAIGNS_EMAIL_TABLE_RESET:
      return defaultCampaignsEmailApiState;
    default:
      return state;
  }
};

const defaultDeliveryReportApiState = {
  isFetching: false,
  report_view: {
    items_per_page: 0,
    total_items: 0,
    columns_headers: [],
    rows: []
  }
};
const deliveryReportApi = (state = defaultDeliveryReportApiState, action) => {
  switch (action.type) {
    case CAMPAIGNS_EMAIL_DELIVERY_REPORT_FETCH_REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case CAMPAIGNS_EMAIL_DELIVERY_REPORT_FETCH_REQUEST_SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.response.data
      };
    case CAMPAIGNS_EMAIL_DELIVERY_REPORT_FETCH_REQUEST_FAILURE:
      return {
        ...state,
        isFetching: false
      };
    case CAMPAIGNS_EMAIL_TABLE_RESET:
      return defaultDeliveryReportApiState;
    default:
      return state;
  }
};

const campaignsEmailTable = combineReducers({
  campaignsEmailApi,
  deliveryReportApi
});

const CampaignsEmailReducers = { campaignsEmailTable };

export default CampaignsEmailReducers;

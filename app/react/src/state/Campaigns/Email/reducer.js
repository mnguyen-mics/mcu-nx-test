import { combineReducers } from 'redux';

import {
  CAMPAIGNS_EMAIL_DELIVERY_REPORT_FETCH,
  CAMPAIGNS_EMAIL_LIST_FETCH,
  CAMPAIGNS_EMAIL_LOAD_ALL,
  CAMPAIGNS_EMAIL_TABLE_RESET,
} from '../../action-types';

const defaultCampaignsEmailApiState = {
  isFetching: false,
  data: [],
  total: 0,
  hasItems: true,
};
const campaignsEmailApi = (state = defaultCampaignsEmailApiState, action) => {
  switch (action.type) {
    case CAMPAIGNS_EMAIL_LOAD_ALL:
    case CAMPAIGNS_EMAIL_LIST_FETCH.REQUEST:
      return {
        ...state,
      };
    case CAMPAIGNS_EMAIL_LIST_FETCH.SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.payload,
      };
    case CAMPAIGNS_EMAIL_LIST_FETCH.FAILURE:
      return {
        ...state,
        isFetching: false,
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
    rows: [],
  },
};
const deliveryReportApi = (state = defaultDeliveryReportApiState, action) => {
  switch (action.type) {
    case CAMPAIGNS_EMAIL_LOAD_ALL:
    case CAMPAIGNS_EMAIL_DELIVERY_REPORT_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case CAMPAIGNS_EMAIL_DELIVERY_REPORT_FETCH.SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.payload.data,
      };
    case CAMPAIGNS_EMAIL_DELIVERY_REPORT_FETCH.FAILURE:
      return {
        ...state,
        isFetching: false,
      };
    case CAMPAIGNS_EMAIL_TABLE_RESET:
      return defaultDeliveryReportApiState;
    default:
      return state;
  }
};

const campaignsEmailTable = combineReducers({
  campaignsEmailApi,
  deliveryReportApi,
});

const CampaignsEmailReducers = { campaignsEmailTable };

export default CampaignsEmailReducers;

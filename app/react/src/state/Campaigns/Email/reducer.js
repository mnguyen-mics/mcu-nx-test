import { combineReducers } from 'redux';

import {
  EMAIL_CAMPAIGNS_DELIVERY_REPORT_FETCH,
  EMAIL_CAMPAIGNS_LIST_FETCH,
  EMAIL_CAMPAIGNS_LOAD_ALL,
  EMAIL_CAMPAIGNS_TABLE_RESET,
} from '../../action-types';

const defaultEmailCampaignsApiState = {
  isFetching: false,
  data: [],
  total: 0,
  hasItems: true,
};
const emailCampaignsApi = (state = defaultEmailCampaignsApiState, action) => {
  switch (action.type) {
    case EMAIL_CAMPAIGNS_LOAD_ALL:
    case EMAIL_CAMPAIGNS_LIST_FETCH.REQUEST:
      return {
        ...state,
      };
    case EMAIL_CAMPAIGNS_LIST_FETCH.SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.payload,
      };
    case EMAIL_CAMPAIGNS_LIST_FETCH.FAILURE:
      return {
        ...state,
        isFetching: false,
      };
    case EMAIL_CAMPAIGNS_TABLE_RESET:
      return defaultEmailCampaignsApiState;
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
    case EMAIL_CAMPAIGNS_LOAD_ALL:
    case EMAIL_CAMPAIGNS_DELIVERY_REPORT_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case EMAIL_CAMPAIGNS_DELIVERY_REPORT_FETCH.SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.payload.data,
      };
    case EMAIL_CAMPAIGNS_DELIVERY_REPORT_FETCH.FAILURE:
      return {
        ...state,
        isFetching: false,
      };
    case EMAIL_CAMPAIGNS_TABLE_RESET:
      return defaultDeliveryReportApiState;
    default:
      return state;
  }
};

const emailCampaignsTable = combineReducers({
  emailCampaignsApi,
  deliveryReportApi,
});

const EmailCampaignsReducers = { emailCampaignsTable };

export default EmailCampaignsReducers;

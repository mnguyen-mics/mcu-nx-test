import { combineReducers } from 'redux';

import {
  CAMPAIGN_EMAIL_FETCH,
  CAMPAIGN_EMAIL_DELIVERY_REPORT_FETCH,
  CAMPAIGN_EMAIL_RESET,
  EMAIL_BLAST_FETCH_ALL,
  EMAIL_BLAST_FETCH_PERFORMANCE
} from '../../action-types';

const defaultCampaignEmailState = {
  campaignEmail: {},
  isFetching: false,
  isUpdating: false,
  isArchiving: false
};

const campaignEmailApi = (state = defaultCampaignEmailState, action) => {
  switch (action.type) {
    case CAMPAIGN_EMAIL_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case CAMPAIGN_EMAIL_FETCH.SUCCESS:
      return {
        ...state,
        campaignEmail: action.payload.data,
        isFetching: false
      };
    case CAMPAIGN_EMAIL_FETCH.FAILURE:
      return defaultCampaignEmailState;

    case CAMPAIGN_EMAIL_RESET:
      return defaultCampaignEmailState;
    default:
      return state;
  }
};

const defaultCampaignEmailReportState = {
  isFetching: false,
  hasFetched: false,
  report_view: {
    items_per_page: 0,
    total_items: 0,
    columns_headers: [],
    rows: []
  }
};

const campaignEmailPerformance = (state = defaultCampaignEmailReportState, action) => {
  switch (action.type) {
    case CAMPAIGN_EMAIL_DELIVERY_REPORT_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case CAMPAIGN_EMAIL_DELIVERY_REPORT_FETCH.SUCCESS:
      return {
        ...state,
        ...action.payload.data,
        isFetching: false,
        hasFetched: true
      };
    case CAMPAIGN_EMAIL_DELIVERY_REPORT_FETCH.FAILURE:
      return {
        ...state,
        isFetching: false,
        hasFetched: true
      };

    case CAMPAIGN_EMAIL_RESET:
      return defaultCampaignEmailReportState;
    default:
      return state;
  }
};

const defaultEmailBlastState = {
  isFetching: false,
  hasFetched: false,
  data: [],
  total: 0
};

const emailBlastApi = (state = defaultEmailBlastState, action) => {
  switch (action.type) {
    case EMAIL_BLAST_FETCH_ALL.REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case EMAIL_BLAST_FETCH_ALL.SUCCESS:
      return {
        ...state,
        data: action.payload.data,
        isFetching: false,
        hasFetched: true
      };
    case EMAIL_BLAST_FETCH_ALL.FAILURE:
      return defaultEmailBlastState;

    case CAMPAIGN_EMAIL_RESET:
      return defaultEmailBlastState;
    default:
      return state;
  }
};

const emailBlastPerformanceState = {
  isFetching: false,
  hasFetched: false,
  report_view: {
    items_per_page: 0,
    total_items: 0,
    columns_headers: [],
    rows: []
  }
};

const emailBlastPerformanceApi = (state = emailBlastPerformanceState, action) => {
  switch (action.type) {
    case EMAIL_BLAST_FETCH_PERFORMANCE.REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case EMAIL_BLAST_FETCH_PERFORMANCE.SUCCESS:
      return {
        ...state,
        ...action.payload.data,
        isFetching: false,
        hasFetched: true
      };
    case EMAIL_BLAST_FETCH_PERFORMANCE.FAILURE:
      return {
        ...state,
        isFetching: false,
        hasFetched: true
      };

    case CAMPAIGN_EMAIL_RESET:
      return emailBlastPerformanceState;
    default:
      return state;
  }
};


const campaignEmailSingle = combineReducers({
  campaignEmailApi,
  campaignEmailPerformance,
  emailBlastApi,
  emailBlastPerformanceApi
});

const CampaignEmailReducers = {
  campaignEmailSingle
};

export default CampaignEmailReducers;

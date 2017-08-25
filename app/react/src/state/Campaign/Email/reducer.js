import { combineReducers } from 'redux';

import {
  EMAIL_CAMPAIGN_FETCH,
  EMAIL_CAMPAIGN_DELIVERY_REPORT_FETCH,
  EMAIL_CAMPAIGN_RESET,
  EMAIL_BLAST_FETCH_ALL,
  EMAIL_BLAST_FETCH_PERFORMANCE,
} from '../../action-types';

const defaultEmailCampaignState = {
  emailCampaign: {},
  isFetching: false,
  isUpdating: false,
  isArchiving: false,
};

const emailCampaignApi = (state = defaultEmailCampaignState, action) => {
  switch (action.type) {
    case EMAIL_CAMPAIGN_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case EMAIL_CAMPAIGN_FETCH.SUCCESS:
      return {
        ...state,
        emailCampaign: action.payload,
        isFetching: false,
      };
    case EMAIL_CAMPAIGN_FETCH.FAILURE:
      return defaultEmailCampaignState;

    case EMAIL_CAMPAIGN_RESET:
      return defaultEmailCampaignState;
    default:
      return state;
  }
};

const defaultEmailCampaignReportState = {
  isFetching: false,
  hasFetched: false,
  report_view: {
    items_per_page: 0,
    total_items: 0,
    columns_headers: [],
    rows: [],
  },
};

const emailCampaignPerformance = (state = defaultEmailCampaignReportState, action) => {
  switch (action.type) {
    case EMAIL_CAMPAIGN_DELIVERY_REPORT_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case EMAIL_CAMPAIGN_DELIVERY_REPORT_FETCH.SUCCESS:
      return {
        ...state,
        ...action.payload.data,
        isFetching: false,
        hasFetched: true,
      };
    case EMAIL_CAMPAIGN_DELIVERY_REPORT_FETCH.FAILURE:
      return {
        ...state,
        isFetching: false,
        hasFetched: true,
      };

    case EMAIL_CAMPAIGN_RESET:
      return defaultEmailCampaignReportState;
    default:
      return state;
  }
};

const defaultEmailBlastState = {
  isFetching: false,
  hasFetched: false,
  data: [],
  total: 0,
};

const emailBlastApi = (state = defaultEmailBlastState, action) => {
  switch (action.type) {
    case EMAIL_BLAST_FETCH_ALL.REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case EMAIL_BLAST_FETCH_ALL.SUCCESS:
      return {
        ...state,
        data: action.payload.data,
        isFetching: false,
        hasFetched: true,
      };
    case EMAIL_BLAST_FETCH_ALL.FAILURE:
      return defaultEmailBlastState;

    case EMAIL_CAMPAIGN_RESET:
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
    rows: [],
  },
};

const emailBlastPerformance = (state = emailBlastPerformanceState, action) => {
  switch (action.type) {
    case EMAIL_BLAST_FETCH_PERFORMANCE.REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case EMAIL_BLAST_FETCH_PERFORMANCE.SUCCESS:
      return {
        ...state,
        ...action.payload.data,
        isFetching: false,
        hasFetched: true,
      };
    case EMAIL_BLAST_FETCH_PERFORMANCE.FAILURE:
      return {
        ...state,
        isFetching: false,
        hasFetched: true,
      };

    case EMAIL_CAMPAIGN_RESET:
      return emailBlastPerformanceState;
    default:
      return state;
  }
};


const emailCampaignSingle = combineReducers({
  emailCampaignApi,
  emailCampaignPerformance,
  emailBlastApi,
  emailBlastPerformance,
});

const EmailCampaignReducers = {
  emailCampaignSingle
};

export default EmailCampaignReducers;

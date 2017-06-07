import { combineReducers } from 'redux';

import {
  CAMPAIGN_EMAIL_ARCHIVE,
  CAMPAIGN_EMAIL_FETCH,
  CAMPAIGN_EMAIL_UPDATE,
  CAMPAIGN_EMAIL_DELIVERY_REPORT_FETCH,
  CAMPAIGN_EMAIL_RESET
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
      return {
        ...state,
        campaignEmail: defaultCampaignEmailState.campaignEmail,
        isFetching: false
      };

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


const campaignEmailSingle = combineReducers({
  campaignEmailApi,
  campaignEmailPerformance
});

const CampaignEmailReducers = {
  campaignEmailSingle
};

export default CampaignEmailReducers;

import {
  CAMPAIGN_EMAIL_ARCHIVE_REQUEST,
  CAMPAIGN_EMAIL_ARCHIVE_REQUEST_FAILURE,
  CAMPAIGN_EMAIL_ARCHIVE_REQUEST_SUCCESS,
  CAMPAIGN_EMAIL_FETCH_REQUEST,
  CAMPAIGN_EMAIL_FETCH_REQUEST_FAILURE,
  CAMPAIGN_EMAIL_FETCH_REQUEST_SUCCESS,
  CAMPAIGN_EMAIL_UPDATE_REQUEST,
  CAMPAIGN_EMAIL_UPDATE_REQUEST_FAILURE,
  CAMPAIGN_EMAIL_UPDATE_REQUEST_SUCCESS,
  CAMPAIGN_EMAIL_RESET
} from '../../action-types';

const defaultCampaignEmailState = {
  campaignEmail: {},
  isFetching: false,
  isUpdating: false,
  isArchiving: false
};

const campaignEmailState = (state = defaultCampaignEmailState, action) => {
  switch (action.type) {
    case CAMPAIGN_EMAIL_FETCH_REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case CAMPAIGN_EMAIL_FETCH_REQUEST_FAILURE:
      return {
        ...state,
        campaignEmail: defaultCampaignEmailState.campaignEmail,
        isFetching: false
      };
    case CAMPAIGN_EMAIL_FETCH_REQUEST_SUCCESS:
      return {
        ...state,
        campaignEmail: action.response.data,
        isFetching: false
      };
    case CAMPAIGN_EMAIL_UPDATE_REQUEST:
      return {
        ...state,
        isUpdating: true
      };
    case CAMPAIGN_EMAIL_ARCHIVE_REQUEST:
      return {
        ...state,
        isArchiving: true
      };
    case CAMPAIGN_EMAIL_UPDATE_REQUEST_FAILURE:
      return {
        ...state,
        isUpdating: false
      };
    case CAMPAIGN_EMAIL_ARCHIVE_REQUEST_FAILURE:
      return {
        ...state,
        isArchiving: false
      };
    case CAMPAIGN_EMAIL_UPDATE_REQUEST_SUCCESS:
      return {
        ...state,
        campaignEmail: action.response.data,
        isUpdating: false
      };
    case CAMPAIGN_EMAIL_ARCHIVE_REQUEST_SUCCESS:
      return {
        ...state,
        isArchiving: false
      };
    case CAMPAIGN_EMAIL_RESET:
      return defaultCampaignEmailState;
    default:
      return state;
  }
};

const CampaignEmailReducers = {
  campaignEmailState
};

export default CampaignEmailReducers;

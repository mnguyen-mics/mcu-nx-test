import {
  CAMPAIGN_EMAIL_ARCHIVE,
  CAMPAIGN_EMAIL_FETCH,
  CAMPAIGN_EMAIL_UPDATE,
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

const CampaignEmailReducers = {
  campaignEmailState
};

export default CampaignEmailReducers;

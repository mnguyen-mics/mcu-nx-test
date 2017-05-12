import { CALL_API } from '../../../middleware/api';

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

const fetchCampaignEmail = id => (dispatch, getState) => {
  const { campaignEmailState } = getState();

  if (campaignEmailState.isFetching) {
    return Promise.resolve();
  }

  return dispatch({
    [CALL_API]: {
      method: 'get',
      endpoint: `email_campaigns/${id}`,
      authenticated: true,
      types: [CAMPAIGN_EMAIL_FETCH_REQUEST, CAMPAIGN_EMAIL_FETCH_REQUEST_FAILURE, CAMPAIGN_EMAIL_FETCH_REQUEST_SUCCESS]
    }
  });
};

const updateCampaignEmail = (id, body) => {
  return (dispatch, getState) => { // eslint-disable-line consistent-return

    const { campaignEmailState } = getState();

    if (campaignEmailState.isUpdating) {
      return Promise.resolve();
    }

    return dispatch({
      [CALL_API]: {
        method: 'put',
        endpoint: `email_campaigns/${id}`,
        body,
        authenticated: true,
        types: [CAMPAIGN_EMAIL_UPDATE_REQUEST, CAMPAIGN_EMAIL_UPDATE_REQUEST_FAILURE, CAMPAIGN_EMAIL_UPDATE_REQUEST_SUCCESS]
      }
    });
  };
};

const archiveCampaignEmail = id => {
  return (dispatch, getState) => { // eslint-disable-line consistent-return
    const { campaignEmailState } = getState();

    if (campaignEmailState.isArchiving) {
      return Promise.resolve();
    }

    const body = {
      archived: true
    };

    dispatch({ type: CAMPAIGN_EMAIL_ARCHIVE_REQUEST });
    return dispatch(updateCampaignEmail(id, body)).then((updatedCampaignEmail) => {
      dispatch({ type: CAMPAIGN_EMAIL_ARCHIVE_REQUEST_SUCCESS });
      return updatedCampaignEmail;
    }).catch(() => { dispatch({ type: CAMPAIGN_EMAIL_ARCHIVE_REQUEST_FAILURE }); });

  };
};

const resetCampaignEmail = () => dispatch => {
  return dispatch({
    type: CAMPAIGN_EMAIL_RESET
  });
};

export {
  fetchCampaignEmail,
  archiveCampaignEmail,
  updateCampaignEmail,
  resetCampaignEmail
};

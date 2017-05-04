import { CALL_API } from '../../middleware/api';

import {
  NAVIGATOR_NOTIFICATIONS_ADD,
  NAVIGATOR_NOTIFICATIONS_REMOVE,
  NAVIGATOR_NOTIFICATIONS_RESET,

  NAVIGATOR_VERSION_REQUEST,
  NAVIGATOR_VERSION_FAILURE,
  NAVIGATOR_VERSION_SUCCESS
 } from '../action-types';

const addNotification = params => dispatch => {
  dispatch({
    type: NAVIGATOR_NOTIFICATIONS_ADD,
    payload: params
  });
};

const removeNotification = index => dispatch => {
  dispatch({
    type: NAVIGATOR_NOTIFICATIONS_REMOVE,
    payload: index
  });
};

const resetNotifications = () => dispatch => {
  dispatch({
    type: NAVIGATOR_NOTIFICATIONS_RESET
  });
};

const getAppVersion = () => (dispatch, getState) => {

  const {
    navigator: {
      version
    }
  } = getState();

  dispatch({
    [CALL_API]: {
      method: 'get',
      localUrl: true,
      endpoint: 'version.json',
      authenticated: false,
      types: [NAVIGATOR_VERSION_REQUEST, NAVIGATOR_VERSION_FAILURE, NAVIGATOR_VERSION_SUCCESS]
    }
  }).then(result => {
    const {
      response: {
        version: newVersion
      }
    } = result;

    if (version && version !== newVersion) {
      dispatch(addNotification({
        type: 'reload',
        messageKey: 'NOTIFICATION_NEW_VERSION_TITLE',
        descriptionKey: 'NOTIFICATION_NEW_VERSION_DESCRIPTION'
      }));
    }
  });
};

export {
  addNotification,
  removeNotification,
  resetNotifications,
  getAppVersion
};

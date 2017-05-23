import { CALL_API } from '../../middleware/apiRequest';

import {
  LOGIN_REFRESH_TOKEN_REQUEST,
  LOGIN_REFRESH_TOKEN_REQUEST_FAILURE,
  LOGIN_REFRESH_TOKEN_REQUEST_SUCCESS,
  LOGIN_RESET
} from '../action-types';

const refreshToken = (credentials) => {
  return (dispatch) => {
    return dispatch({
      [CALL_API]: {
        method: 'post',
        endpoint: 'authentication/refresh_tokens',
        body: credentials,
        authenticated: false,
        types: [LOGIN_REFRESH_TOKEN_REQUEST, LOGIN_REFRESH_TOKEN_REQUEST_FAILURE, LOGIN_REFRESH_TOKEN_REQUEST_SUCCESS]
      }
    });
  };
};

const resetLogin = () => {
  return dispatch => {
    return dispatch({
      type: LOGIN_RESET
    });
  };
};

export {
  refreshToken,
  resetLogin
};

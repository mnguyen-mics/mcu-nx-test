import {
  LOGIN_REFRESH_TOKEN_REQUEST,
  LOGIN_REFRESH_TOKEN_REQUEST_FAILURE,
  LOGIN_REFRESH_TOKEN_REQUEST_SUCCESS,
  LOGIN_RESET
} from '../action-types';

const defaultLoginState = {
  refresh_token: null,
  isFetching: false
};

const loginState = (state = defaultLoginState, action) => {

  switch (action.type) {

    case LOGIN_REFRESH_TOKEN_REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case LOGIN_REFRESH_TOKEN_REQUEST_SUCCESS:
      return {
        ...state,
        isFetching: false,
        refresh_token: action.response.data.refresh_token
      };
    case LOGIN_REFRESH_TOKEN_REQUEST_FAILURE:
      return {
        ...state,
        isFetching: false,
        error: action.response.error
      };
    case LOGIN_RESET:
      return defaultLoginState;

    default:
      return state;
  }

};

const LoginStateReducers = {
  loginState
};

export default LoginStateReducers;

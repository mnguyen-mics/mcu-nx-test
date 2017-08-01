import {
  LOG_IN,
} from '../action-types';

const defaultLoginState = {
  isRequesting: false,
  hasError: false,
  error: {},
};

const login = (state = defaultLoginState, action) => {

  switch (action.type) {

    case LOG_IN.REQUEST:
      return {
        ...state,
        isRequesting: true,
      };
    case LOG_IN.FAILURE:
      return {
        isRequesting: false,
        hasError: true,
        error: action.payload,
      };
    case LOG_IN.SUCCESS:
      return defaultLoginState;
    default:
      return state;
  }

};

const LoginStateReducers = {
  login,
};

export default LoginStateReducers;

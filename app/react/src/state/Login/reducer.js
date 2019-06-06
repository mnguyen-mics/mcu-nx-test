import {
  LOG_IN,
} from '../action-types';

const defaultLoginState = {
  hasError: false,
  error: {},
};

const login = (state = defaultLoginState, action) => {

  switch (action.type) {

    case LOG_IN.REQUEST:
      return {
        ...state,
      };
    case LOG_IN.FAILURE:
      return {
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

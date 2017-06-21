import {
  PASSWORD_FORGOT,
  PASSWORD_FORGOT_RESET
} from '../action-types';

const defaultForgotPasswordState = {
  isRequesting: false,
  hasError: false,
  passwordSentSuccess: false,
  error: {}
};

const forgotPassword = (state = defaultForgotPasswordState, action) => {

  switch (action.type) {

    case PASSWORD_FORGOT.REQUEST:
      return {
        ...state,
        isRequesting: true
      };
    case PASSWORD_FORGOT.FAILURE:
      return {
        isRequesting: false,
        hasError: true,
        error: action.payload
      };
    case PASSWORD_FORGOT.SUCCESS:
      return {
        ...state,
        passwordSentSuccess: true
      };
    case PASSWORD_FORGOT_RESET:
      return defaultForgotPasswordState;
    default:
      return state;
  }

};

const ForgotPasswordReducers = {
  forgotPassword
};

export default ForgotPasswordReducers;

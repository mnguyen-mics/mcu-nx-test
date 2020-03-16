import { LOG_IN } from '../action-types';
import { Action } from 'redux-actions';
import { Payload } from '../../utils/ReduxHelper';

const defaultLoginState = {
  hasError: false,
  error: {},
};

const login = (state = defaultLoginState, action: Action<Payload>) => {
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
    case LOG_IN.EXPIRED_PASSWORD:
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

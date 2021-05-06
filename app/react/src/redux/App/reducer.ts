import { APP_STARTUP } from '../action-types';
import { Action } from 'redux-actions';
import { Payload } from '../../utils/ReduxHelper';

const app = (
  state = {
    initialized: false,
    initializationError: false,
  },
  action: Action<Payload>,
) => {
  switch (action.type) {
    case APP_STARTUP.SUCCESS:
      return {
        ...state,
        initialized: true,
      };
    case APP_STARTUP.FAILURE:
      return {
        ...state,
        initializationError: true,
        error: action.payload,
      };
    default:
      return state;
  }
};

const AppReducer = {
  app,
};

export default AppReducer;

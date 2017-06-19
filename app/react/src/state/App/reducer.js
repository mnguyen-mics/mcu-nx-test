import {
  APP_STARTUP
} from '../action-types';

const app = (state = {
  initialized: false,
  initializationError: false
}, action) => {
  switch (action.type) {
    case APP_STARTUP.SUCCESS:
      return {
        ...state,
        initialized: true
      };
    case APP_STARTUP.FAILURE:
      return {
        ...state,
        initializationError: true,
        error: action.payload
      };
    default:
      return state;
  }
};

const AppReducer = {
  app
};

export default AppReducer;

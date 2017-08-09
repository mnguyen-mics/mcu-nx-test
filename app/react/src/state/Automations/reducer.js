import { combineReducers } from 'redux';

import {
  AUTOMATIONS_LIST_FETCH,
  AUTOMATIONS_LIST_TABLE_RESET,
} from '../action-types';

const defaultAutomationsApiState = {
  isFetching: false,
  data: [],
  total: 0,
  hasItems: true,
};

const automationsApi = (state = defaultAutomationsApiState, action) => {
  switch (action.type) {

    case AUTOMATIONS_LIST_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case AUTOMATIONS_LIST_FETCH.SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.payload,
      };
    case AUTOMATIONS_LIST_FETCH.FAILURE:
      return {
        ...state,
        isFetching: false,
      };
    case AUTOMATIONS_LIST_TABLE_RESET:
      return defaultAutomationsApiState;
    default:
      return state;
  }
};


const automationsTable = combineReducers({
  automationsApi,
});

const AutomationsReducers = { automationsTable };

export default AutomationsReducers;

import { combineReducers } from 'redux';

import {
  CREATIVES_DISPLAY_FETCH,
  CREATIVES_DISPLAY_TABLE_RESET
} from '../../action-types';

const defaultCreativeDisplayApiState = {
  isFetching: false,
  data: [],
  total: 0,
  hasItems: true
};

const creativeDisplayApi = (state = defaultCreativeDisplayApiState, action) => {
  switch (action.type) {

    case CREATIVES_DISPLAY_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case CREATIVES_DISPLAY_FETCH.SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.payload
      };
    case CREATIVES_DISPLAY_FETCH.FAILURE:
      return {
        ...state,
        isFetching: false
      };
    case CREATIVES_DISPLAY_TABLE_RESET:
      return defaultCreativeDisplayApiState;
    default:
      return state;
  }
};


const creativeDisplayTable = combineReducers({
  creativeDisplayApi
});

const creativeDisplayReducers = { creativeDisplayTable };

export default creativeDisplayReducers;

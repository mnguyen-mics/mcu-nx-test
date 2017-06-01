import { combineReducers } from 'redux';

import {
  CREATIVES_EMAILS_FETCH,
  CREATIVES_EMAILS_TABLE_RESET
} from '../../action-types';

const defaultCreativeEmailsApiState = {
  isFetching: false,
  data: [],
  total: 0
};

const creativeEmailsApi = (state = defaultCreativeEmailsApiState, action) => {
  switch (action.type) {

    case CREATIVES_EMAILS_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case CREATIVES_EMAILS_FETCH.SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.payload
      };
    case CREATIVES_EMAILS_FETCH.FAILURE:
      return {
        ...state,
        isFetching: false
      };
    case CREATIVES_EMAILS_TABLE_RESET:
      return defaultCreativeEmailsApiState;
    default:
      return state;
  }
};


const creativeEmailsTable = combineReducers({
  creativeEmailsApi
});

const creativeEmailsReducers = { creativeEmailsTable };

export default creativeEmailsReducers;

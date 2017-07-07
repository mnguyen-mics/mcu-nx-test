import { combineReducers } from 'redux';

import {
  KEYWORD_LISTS_FETCH,
  KEYWORD_LISTS_TABLE_RESET
} from '../../action-types';

const defaultKeywordListApiState = {
  isFetching: false,
  data: [],
  total: 0,
  hasItems: true
};

const keywordListsApi = (state = defaultKeywordListApiState, action) => {
  switch (action.type) {

    case KEYWORD_LISTS_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case KEYWORD_LISTS_FETCH.SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.payload
      };
    case KEYWORD_LISTS_FETCH.FAILURE:
      return {
        ...state,
        isFetching: false
      };
    case KEYWORD_LISTS_TABLE_RESET:
      return defaultKeywordListApiState;
    default:
      return state;
  }
};


const keywordListTable = combineReducers({
  keywordListsApi
});

const KeywordListsReducers = { keywordListTable };

export default KeywordListsReducers;

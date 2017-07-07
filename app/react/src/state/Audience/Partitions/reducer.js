import { combineReducers } from 'redux';

import {
  // AUDIENCE_PARTITIONS_DELETE_REQUEST,
  // AUDIENCE_PARTITIONS_DELETE_REQUEST_FAILURE,
  // AUDIENCE_PARTITIONS_DELETE_REQUEST_SUCCESS,

  AUDIENCE_PARTITIONS_LOAD_ALL,
  AUDIENCE_PARTITIONS_LIST_FETCH,
  AUDIENCE_PARTITIONS_TABLE_RESET
} from '../../action-types';

const defaultAudiencePartitionsApiState = {
  isFetching: false,
  data: [],
  total: 0,
  hasItems: true
};

const audiencePartitionsApi = (state = defaultAudiencePartitionsApiState, action) => {
  switch (action.type) {
    case AUDIENCE_PARTITIONS_LOAD_ALL:
    case AUDIENCE_PARTITIONS_LIST_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case AUDIENCE_PARTITIONS_LIST_FETCH.SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.payload
      };
    case AUDIENCE_PARTITIONS_LIST_FETCH.FAILURE:
      return {
        ...state,
        isFetching: false
      };
    case AUDIENCE_PARTITIONS_TABLE_RESET:
      return defaultAudiencePartitionsApiState;
    default:
      return state;
  }
};


const audiencePartitionsTable = combineReducers({
  audiencePartitionsApi
});

const AudiencePartitionsReducers = { audiencePartitionsTable };

export default AudiencePartitionsReducers;

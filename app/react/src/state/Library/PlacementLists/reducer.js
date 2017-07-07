import { combineReducers } from 'redux';

import {
  PLACEMENT_LISTS_FETCH,
  PLACEMENT_LISTS_TABLE_RESET
} from '../../action-types';

const defaultPlacementListApiState = {
  isFetching: false,
  data: [],
  total: 0,
  hasItems: true
};

const placementListsApi = (state = defaultPlacementListApiState, action) => {
  switch (action.type) {

    case PLACEMENT_LISTS_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case PLACEMENT_LISTS_FETCH.SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.payload
      };
    case PLACEMENT_LISTS_FETCH.FAILURE:
      return {
        ...state,
        isFetching: false
      };
    case PLACEMENT_LISTS_TABLE_RESET:
      return defaultPlacementListApiState;
    default:
      return state;
  }
};


const placementListTable = combineReducers({
  placementListsApi
});

const PlacementListsReducers = { placementListTable };

export default PlacementListsReducers;

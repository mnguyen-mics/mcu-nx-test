import { combineReducers } from 'redux';

import {
  ASSETS_FILES_FETCH,
  ASSETS_FILES_TABLE_RESET
} from '../../action-types';

const defaultAssetsFilesApiState = {
  isFetching: false,
  data: [],
  total: 0
};

const assetsFilesApi = (state = defaultAssetsFilesApiState, action) => {
  switch (action.type) {

    case ASSETS_FILES_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case ASSETS_FILES_FETCH.SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.payload
      };
    case ASSETS_FILES_FETCH.FAILURE:
      return {
        ...state,
        isFetching: false
      };
    case ASSETS_FILES_TABLE_RESET:
      return defaultAssetsFilesApiState;
    default:
      return state;
  }
};


const assetsFilesTable = combineReducers({
  assetsFilesApi
});

const AssetsFilesReducers = { assetsFilesTable };

export default AssetsFilesReducers;

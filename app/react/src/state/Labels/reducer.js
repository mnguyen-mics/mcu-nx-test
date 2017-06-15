import { combineReducers } from 'redux';

import {
  LABELS_FETCH,
  // LABELS_CREATE,
  // LABELS_UPDATE,
  // LABELS_PAIR,
  // LABELS_UNPAIR,
  LABELS_RESET,
  LABELS_OBJECT_FETCH
} from '../action-types';

const defaultLabelsApiState = {
  isFetching: false,
  data: [],
  total: 0
};

const labelsApi = (state = defaultLabelsApiState, action) => {
  switch (action.type) {
    case LABELS_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case LABELS_FETCH.SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.payload
      };
    case LABELS_FETCH.FAILURE:
      return {
        ...state,
        isFetching: false
      };
    case LABELS_RESET:
      return defaultLabelsApiState;
    default:
      return state;
  }
};

const defaultLabelsAttachedApiState = {
  isFetching: false,
  data: [],
  total: 0
};

const labelsAttachedApi = (state = defaultLabelsAttachedApiState, action) => {
  switch (action.type) {
    case LABELS_OBJECT_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case LABELS_OBJECT_FETCH.SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.payload
      };
    case LABELS_OBJECT_FETCH.FAILURE:
      return {
        ...state,
        isFetching: false
      };
    case LABELS_RESET:
      return defaultLabelsApiState;
    default:
      return state;
  }
};

const labels = combineReducers({
  labelsApi,
  labelsAttachedApi
});

const LabelsReducers = { labels };

export default LabelsReducers;

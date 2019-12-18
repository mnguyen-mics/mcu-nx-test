import { combineReducers } from 'redux';

import { LABELS_FETCH, LABELS_RESET } from '../action-types';
import { Action } from 'redux-actions';
import { Payload } from '../../utils/ReduxHelper';

const defaultLabelsApiState = {
  isFetching: false,
  data: [],
  total: 0,
};

const labelsApi = (state = defaultLabelsApiState, action: Action<Payload>) => {
  switch (action.type) {
    case LABELS_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case LABELS_FETCH.SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.payload,
      };
    case LABELS_FETCH.FAILURE:
      return {
        ...state,
        isFetching: false,
      };
    case LABELS_RESET:
      return defaultLabelsApiState;
    default:
      return state;
  }
};

const labels = combineReducers({
  labelsApi,
});

const LabelsReducers = { labels };

export default LabelsReducers;

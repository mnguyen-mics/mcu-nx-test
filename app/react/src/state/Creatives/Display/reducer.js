import { combineReducers } from 'redux';

import { createRequestMetadataReducer } from '../../../utils/ReduxHelper';
import { normalizeArrayOfObject } from '../../../utils/Normalizer.ts';

import {
  CREATIVES_DISPLAY_FETCH,
  CREATIVES_DISPLAY_RESET,
} from '../../action-types';

const displayCreativesById = (state = {}, action) => {
  switch (action.type) {
    case CREATIVES_DISPLAY_FETCH.SUCCESS:
      return normalizeArrayOfObject(action.payload.data, 'id');
    case CREATIVES_DISPLAY_FETCH.FAILURE:
    case CREATIVES_DISPLAY_RESET:
      return {};
    default:
      return state;
  }
};

const allDisplayCreatives = (state = [], action) => {
  switch (action.type) {
    case CREATIVES_DISPLAY_FETCH.SUCCESS:
      return action.payload.data.map(displayCreatives => displayCreatives.id);
    case CREATIVES_DISPLAY_FETCH.FAILURE:
    case CREATIVES_DISPLAY_RESET:
      return [];
    default:
      return state;
  }
};

const hasItems = (state = true, action) => {
  switch (action.type) {
    case CREATIVES_DISPLAY_FETCH.SUCCESS:
      return action.payload.hasItems || true;
    case CREATIVES_DISPLAY_RESET:
      return true;
    default:
      return state;
  }
};

const displayCreatives = combineReducers({
  byId: displayCreativesById,
  allIds: allDisplayCreatives,
  metadata: createRequestMetadataReducer(CREATIVES_DISPLAY_FETCH),
  hasItems,
});

export default displayCreatives;

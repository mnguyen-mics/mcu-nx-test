import { combineReducers } from 'redux';

import { createRequestMetadataReducer } from '../../../utils/ReduxHelper';
import { normalizeArrayOfObject } from '../../../utils/Normalizer.ts';

import {
  CREATIVES_NATIVE_FETCH,
  CREATIVES_NATIVE_RESET,
} from '../../action-types';

const nativeCreativesById = (state = {}, action) => {
  switch (action.type) {
    case CREATIVES_NATIVE_FETCH.SUCCESS:
      return normalizeArrayOfObject(action.payload.data, 'id');
    case CREATIVES_NATIVE_FETCH.FAILURE:
    case CREATIVES_NATIVE_RESET:
      return {};
    default:
      return state;
  }
};

const allNativeCreatives = (state = [], action) => {
  switch (action.type) {
    case CREATIVES_NATIVE_FETCH.SUCCESS:
      return action.payload.data.map(nativeCreatives => nativeCreatives.id);
    case CREATIVES_NATIVE_FETCH.FAILURE:
    case CREATIVES_NATIVE_RESET:
      return [];
    default:
      return state;
  }
};

const hasItems = (state = true, action) => {
  switch (action.type) {
    case CREATIVES_NATIVE_FETCH.SUCCESS:
      return action.payload.hasItems || true;
    case CREATIVES_NATIVE_RESET:
      return true;
    default:
      return state;
  }
};

const nativeCreatives = combineReducers({
  byId: nativeCreativesById,
  allIds: allNativeCreatives,
  metadata: createRequestMetadataReducer(CREATIVES_NATIVE_FETCH),
  hasItems,
});

export default nativeCreatives;

import { combineReducers } from 'redux';

import { createRequestMetadataReducer } from '../../../utils/ReduxHelper';
import { normalizeArrayOfObject } from '../../../utils/Normalizer.ts';

import {
  CREATIVES_EMAIL_FETCH,
  CREATIVES_EMAIL_RESET,
} from '../../action-types';

const emailTemplatesById = (state = {}, action) => {
  switch (action.type) {
    case CREATIVES_EMAIL_FETCH.SUCCESS:
      return normalizeArrayOfObject(action.payload.data, 'id');
    case CREATIVES_EMAIL_FETCH.FAILURE:
    case CREATIVES_EMAIL_RESET:
      return {};
    default:
      return state;
  }
};

const allEmailTemplates = (state = [], action) => {
  switch (action.type) {
    case CREATIVES_EMAIL_FETCH.SUCCESS:
      return action.payload.data.map(emailTemplates => emailTemplates.id);
    case CREATIVES_EMAIL_FETCH.FAILURE:
    case CREATIVES_EMAIL_RESET:
      return [];
    default:
      return state;
  }
};

const hasItems = (state = true, action) => {
  switch (action.type) {
    case CREATIVES_EMAIL_FETCH.SUCCESS:
      return action.payload.hasItems || true;
    case CREATIVES_EMAIL_RESET:
      return true;
    default:
      return state;
  }
};

const emailTemplates = combineReducers({
  byId: emailTemplatesById,
  allIds: allEmailTemplates,
  metadata: createRequestMetadataReducer(CREATIVES_EMAIL_FETCH),
  hasItems,
});

export default emailTemplates;

import { combineReducers } from 'redux';

import { normalizeArrayOfObject } from '../../utils/Normalizer';
import { EMAIL_ROUTER_LIST_FETCH } from '../action-types';

const emailRoutersById = (state = {}, action) => {
  switch (action.type) {
    case EMAIL_ROUTER_LIST_FETCH.SUCCESS:
      return normalizeArrayOfObject(action.payload, 'id');
    case EMAIL_ROUTER_LIST_FETCH.FAILURE:
      return {};
    default:
      return state;
  }
};

const allEmailRouters = (state = [], action) => {
  switch (action.type) {
    case EMAIL_ROUTER_LIST_FETCH.SUCCESS:
      return action.payload.data.map(router => router.id);
    case EMAIL_ROUTER_LIST_FETCH.FAILURE:
      return [];
    default:
      return state;
  }
};

const emailRouters = combineReducers({
  byId: emailRoutersById,
  allIds: allEmailRouters
});

export default emailRouters;

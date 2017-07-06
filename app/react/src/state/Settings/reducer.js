import { combineReducers } from 'redux';

import {
  SAVE_PROFILE,
  SAVE_ORGANISATION
} from '../../action-types';

// TODO try to intruce a higher order reducer
// that handle isFetching base on type name (x.REQUEST, x.SUCCESS, ...)

const userAccountApi = (state = {}, action) => {
  switch (action.type) {
    case SAVE_PROFILE.REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case SAVE_PROFILE.SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.payload
      };
    case SAVE_PROFILE.FAILURE:
      return {
        ...state,
        isFetching: false
      };
    default:
      return state;
  }
};

const organisationAccountApi = (state = {}, action) => {
  switch (action.type) {
    case SAVE_ORGANISATION.REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case SAVE_ORGANISATION.SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.payload
      };
    case SAVE_ORGANISATION.FAILURE:
      return {
        ...state,
        isFetching: false
      };
    default:
      return state;
  }
};

const AccountSettingsReducers = combineReducers({ userAccountApi, organisationAccountApi });

export default { AccountSettingsReducers };

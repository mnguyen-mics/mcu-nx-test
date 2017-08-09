import { SAVE_PROFILE } from '../action-types';

// TODO try to intruce a higher order reducer
// that handle isFetching base on type name (x.REQUEST, x.SUCCESS, ...)

const userAccountApi = (state = {}, action) => {
  switch (action.type) {
    case SAVE_PROFILE.REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case SAVE_PROFILE.SUCCESS:
      return {
        ...state,
        isFetching: false,
        ...action.payload,
      };
    case SAVE_PROFILE.FAILURE:
      return {
        ...state,
        isFetching: false,
      };
    default:
      return state;
  }
};

const AccountSettingsReducers = userAccountApi;

export default { AccountSettingsReducers };

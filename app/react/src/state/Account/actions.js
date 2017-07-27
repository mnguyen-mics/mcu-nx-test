import { createAction } from 'redux-actions';

import {
  SAVE_PROFILE
} from '../action-types';

const saveProfile = {
  request: (user) => createAction(SAVE_PROFILE.REQUEST)(user),
  success: (response) => createAction(SAVE_PROFILE.SUCCESS)(response),
  failure: (error) => createAction(SAVE_PROFILE.FAILURE)(error)
};

export {
  saveProfile
};

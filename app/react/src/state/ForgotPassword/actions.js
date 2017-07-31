import { createAction } from 'redux-actions';

import {
  PASSWORD_FORGOT,
  PASSWORD_FORGOT_RESET
} from '../action-types';

const sendPassword = {
  request: (email) => createAction(PASSWORD_FORGOT.REQUEST)(email),
  success: (response) => createAction(PASSWORD_FORGOT.SUCCESS)(response),
  failure: (error) => createAction(PASSWORD_FORGOT.FAILURE)(error)

};

const passwordForgotReset = createAction(PASSWORD_FORGOT_RESET);


export {
  sendPassword,
  passwordForgotReset
};

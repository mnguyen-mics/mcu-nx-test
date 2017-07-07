import { takeEvery } from 'redux-saga';
import { call, put, fork } from 'redux-saga/effects';
import SettingsService from '../../services/SettingsService';
import { addNotification } from '../Notifications/actions'
import { getConnectedUser } from '../Session/actions'

import log from '../../utils/Logger';

import {
  SAVE_PROFILE
} from '../action-types';

import {
  saveProfile
} from './actions';

function* updateRemoteProfile({ payload }) {
  try {
    const userProfile = payload;
    const organisation_id = userProfile.workspaces[userProfile.default_workspace].organisation_id;
    const response = yield call(SettingsService.putProfile, organisation_id, userProfile);
    yield put(saveProfile.success(response));
    yield put(getConnectedUser.request());
    yield put(addNotification({
          type: 'error',
          messageKey: 'NOTIFICATION_ERROR_TITLE',
          descriptionKey: 'NOTIFICATION_ERROR_DESCRIPTION'
      }));
  } catch (e) {
    log.error(e);
    yield put(saveProfile.failure(e));
    yield put(addNotification({
          type: 'success'/*,
          messageKey: 'Success',
          descriptionKey: 'Success'*/
        }));
  }
}

function* watchSaveProfileRequest() {
  yield* takeEvery(SAVE_PROFILE.REQUEST, updateRemoteProfile);
}

export const settingsSagas = [
  fork(watchSaveProfileRequest)
];

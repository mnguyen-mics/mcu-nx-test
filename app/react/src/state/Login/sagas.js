/* eslint-disable no-constant-condition */
import { delay } from 'redux-saga';
import { call, put, take, race, fork } from 'redux-saga/effects';
import moment from 'moment';

import log from '../../utils/Logger';
import AuthService from '../../services/AuthService';

import {
  LOG_IN,
  LOG_OUT,
  CONNECTED_USER
} from '../action-types';

import { logIn } from './actions';
import { getConnectedUser } from '../Session/actions';


function* authorize(credentialsOrRefreshToken) {
  const response = yield call(AuthService.createAccessToken, credentialsOrRefreshToken);
  const { accessToken, expireIn, refreshToken } = response;
  yield call(AuthService.setAccessToken, accessToken);
  yield call(AuthService.setAccessTokenExpirationDate, expireIn);

    // Update refresh token if API sent a new one
  if (refreshToken) {
    log.debug(`Store refresh token ${refreshToken}`);
    yield call(AuthService.setRefreshToken, refreshToken);
  }

  yield put(logIn.success(accessToken));
  return response;
}

function* authorizeLoop(credentialsOrRefreshToken, useStoredAccessToken = false, remember = false) {
  try {
    log.debug('Authorize user with credentialsOrRefreshToken');

    let refreshToken = false;
    let expiresIn = null;
    if (useStoredAccessToken) {
      const expirationDate = yield call(AuthService.getAccessTokenExpirationDate);
      expiresIn = expirationDate.diff(moment(), 'seconds');
      refreshToken = yield call(AuthService.getRefreshToken);
    } else if (remember) {
      refreshToken = yield call(AuthService.createRefreshToken, credentialsOrRefreshToken);
      const result = yield call(authorize, { refreshToken });
      refreshToken = result.refreshToken;
      expiresIn = result.expiresIn;
    } else {
      const result = yield call(authorize, credentialsOrRefreshToken);
      refreshToken = result.refreshToken;
      expiresIn = result.expiresIn;
    }

    const connectedUser = yield call(AuthService.getConnectedUser);
    yield put(getConnectedUser.success(connectedUser));

    // set global variable used by angular to run Session.init(organisationId) on stateChangeStart ui router hook
    window.organisationId = connectedUser.workspaces[connectedUser.default_workspace].organisation_id; // eslint-disable-line no-undef

    if (!refreshToken) {
    // Wait till access token expire
      const waitInMs = expiresIn * 1000;
      log.debug(`Will LOG_OUT in ${waitInMs} ms`);
      yield call(delay, waitInMs);
      yield put(LOG_OUT);
    } else {
      while (true) {
        // check expirein variable
        const waitInMs = (expiresIn * 1000) - (60 * 1000);
        log.debug(`Will refresh access token in ${waitInMs} ms`);
        yield call(delay, waitInMs);
        const storedRefreshToken = yield call(AuthService.getRefreshToken);
        log.debug(`Authorize user with refresh token ${storedRefreshToken}`);
        yield call(authorize, { refreshToken: storedRefreshToken });
      }
    }
  } catch (e) {
    log.error('Authorize error : ', e);
    yield call(AuthService.deleteCredentials);
    yield put(logIn.failure(e));
  }
}

function* authentication() {
  while (true) {
    const storedRefreshToken = yield call(AuthService.getRefreshToken);
    const isAuthenticated = yield call(AuthService.isAuthenticated);

    let credentialsOrRefreshToken = null;
    let remember = false;

    // TODO check non expired storedRefreshToken
    if (!storedRefreshToken && !isAuthenticated) {

      // Wait for LOG_IN.REQUEST
      const { payload } = yield take(LOG_IN.REQUEST);

      if (payload.remember) {
        remember = true;
      }

      credentialsOrRefreshToken = {
        email: payload.email,
        password: payload.password
      };
    } else {
      credentialsOrRefreshToken = {
        refreshToken: storedRefreshToken
      };
    }

    const { signOutAction } = yield race({
      signOutAction: take(LOG_OUT),
      authorizeLoop: call(authorizeLoop, credentialsOrRefreshToken, isAuthenticated, remember)
    });

    if (signOutAction) {
      yield call(AuthService.deleteCredentials);
      const { meta: { redirectCb } } = signOutAction;
      redirectCb();
    }

  }
}

function* redirectAfterLogin() {
  while (true) {
    const { meta: { redirect } } = yield take(LOG_IN.REQUEST);
    yield take(CONNECTED_USER.SUCCESS);
    redirect();
  }
}

export const loginSagas = [
  fork(redirectAfterLogin),
  fork(authentication)
];

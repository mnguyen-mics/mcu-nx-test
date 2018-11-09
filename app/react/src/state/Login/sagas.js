/* eslint-disable no-constant-condition */
import { delay } from 'redux-saga';
import { call, put, take, race, fork, all } from 'redux-saga/effects';
import moment from 'moment';
import MicsTagServices from '../../services/MicsTagServices.ts';

import log from '../../utils/Logger';
import AuthService from '../../services/AuthService';

import {
  LOG_IN,
  LOG_OUT,
  CONNECTED_USER,
  STORE_ORG_FEATURES,
} from '../action-types';

import { logIn } from './actions';
import { getConnectedUser } from '../Session/actions';
import { setOrgFeature } from '../Features/actions';


function* authorize(credentialsOrRefreshToken) {
  const response = yield call(AuthService.createAccessToken, credentialsOrRefreshToken);
  const { accessToken, expiresIn, refreshToken } = response;
  yield call(AuthService.setAccessToken, accessToken);
  if (window.angular.element(global.document.body).injector()) {
    window.angular.element(global.document.body).injector().get('Restangular').setDefaultHeaders({ Authorization: accessToken });
  }
  yield call(AuthService.setAccessTokenExpirationDate, expiresIn);
  // Update refresh token if API sent a new one
  if (refreshToken) {
    log.debug(`Store refresh token ${refreshToken}`);
    yield call(AuthService.setRefreshToken, refreshToken);
    const remember = yield call(AuthService.getRememberMe);
    if (remember) {
      yield call(AuthService.setRefreshTokenExpirationDate);
    } else {
      yield call(AuthService.setRefreshTokenExpirationDate, expiresIn);
    }
  }

  yield put(logIn.success(accessToken));
  return response;
}

function* authorizeLoop(credentialsOrRefreshToken, useStoredAccessToken = false, remember = false) {
  try {
    log.debug('Authorize user with credentialsOrRefreshToken', credentialsOrRefreshToken);
    let refreshToken = false;
    let expiresIn = null;

    if (useStoredAccessToken) {
      // already has an access token
      const expirationDate = yield call(AuthService.getAccessTokenExpirationDate);
      expiresIn = expirationDate.diff(moment(), 'seconds');
      refreshToken = yield call(AuthService.getRefreshToken);
      if (!refreshToken) { refreshToken = yield call(AuthService.createRefreshToken, credentialsOrRefreshToken); }
    } else if (remember) {
      // has just signed up with remember me
      refreshToken = yield call(AuthService.createRefreshToken, credentialsOrRefreshToken);
      const result = yield call(authorize, { refreshToken });
      refreshToken = result.refreshToken;
      expiresIn = result.expiresIn;
    } else {
      // has just signed up with no remember me
      if (!remember && !refreshToken) {
        refreshToken = yield call(AuthService.createRefreshToken, credentialsOrRefreshToken);
      }
      const result = yield call(authorize, { refreshToken });
      refreshToken = result.refreshToken;
      expiresIn = result.expiresIn;
    }
    const connectedUser = yield call(AuthService.getConnectedUser);
    yield put(setOrgFeature(global.window.MCS_CONSTANTS.FEATURES));
    MicsTagServices.addUserAccountProperty(connectedUser.id);
    MicsTagServices.setUserProperties(connectedUser);
    yield put(getConnectedUser.success(connectedUser));

    // set global variable used by angular to run Session.init(organisationId) on stateChangeStart ui router hook
    window.organisationId = connectedUser.workspaces[connectedUser.default_workspace].organisation_id; // eslint-disable-line no-undef

    if (!refreshToken) {
      // No refresh token means we log out
      yield put(LOG_OUT);
    } else {
      while (true) {
        // check expirein variable
        const waitInMs = (expiresIn * 1000) - (60 * 1000);
        log.debug(`Will refresh access token in ${waitInMs} ms`);
        yield call(delay, waitInMs);
        const storedRefreshToken = yield call(AuthService.getRefreshToken);
        log.debug(`Authorize user with refresh token ${storedRefreshToken}`);
        const results = yield call(authorize, { refreshToken: storedRefreshToken });
        expiresIn = results.expiresIn;
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
    let storedRefreshToken;

    const storedRefreshTokenExpirationDate = yield call(AuthService.getRefreshTokenExpirationDate);
    if (storedRefreshTokenExpirationDate.diff(moment(), 'seconds') > 0) {
      storedRefreshToken = yield call(AuthService.getRefreshToken);
    }

    const isAuthenticated = yield call(AuthService.isAuthenticated);

    let credentialsOrRefreshToken = null;
    let remember = false;

    // TODO check non expired storedRefreshToken
    // Is not logged in and has no refresh token
    if (!storedRefreshToken && !isAuthenticated) {
      // Wait for LOG_IN.REQUEST

      const { payload } = yield take(LOG_IN.REQUEST);
      if (payload.remember) {
        remember = true;
        yield call(AuthService.setRememberMe, { rememberMe: true });
      }

      const rememberMe = yield call(AuthService.getRememberMe);
      if (rememberMe) {
        remember = true;
      }

      credentialsOrRefreshToken = {
        email: payload.email,
        password: payload.password,
      };

    } else if (storedRefreshToken) {
      credentialsOrRefreshToken = {
        refreshToken: storedRefreshToken,
      };
    }

    const { signOutAction } = yield race({
      signOutAction: take(LOG_OUT),
      authorizeLoop: call(authorizeLoop, credentialsOrRefreshToken, isAuthenticated, remember),
    });

    if (signOutAction) {
      yield call(AuthService.deleteCredentials);
      if (signOutAction.meta && signOutAction.meta.redirectCb) {
        signOutAction.meta.redirectCb();
      }
    }

  }
}

function* redirectAfterLogin() {
  while (true) {
    const { meta: { redirect } } = yield take(LOG_IN.REQUEST);
    yield all([
      take(CONNECTED_USER.SUCCESS),
      take(STORE_ORG_FEATURES)
    ]);
    redirect();
  }
}

export const loginSagas = [
  fork(redirectAfterLogin),
  fork(authentication),
];

/* eslint-disable no-constant-condition */
/* eslint-disable camelcase */
import { delay } from 'redux-saga';
import { call, put, take, race, fork, all, select } from 'redux-saga/effects';
import MicsTagServices from '../../services/MicsTagServices.ts';

import log from '../../utils/Logger.ts';
import AuthService from '../../services/AuthService.ts';
import PersistedStoreService from '../../services/PersistedStoreService.ts';
import {
  LOG_IN,
  LOG_OUT,
  CONNECTED_USER,
  STORE_ORG_FEATURES,
} from '../action-types';
import { logIn } from './actions';
import { getConnectedUser } from '../Session/actions';
import { setOrgFeature } from '../Features/actions';
import { getStoredConnectedUser } from '../Session/selectors';

const persistedStoreService = new PersistedStoreService();

function* authorize(credentialsOrRefreshToken) {
  const response = yield call(
    AuthService.createAccessToken,
    credentialsOrRefreshToken,
  );
  const { access_token, expires_in, refresh_token } = response.data;
  yield call(AuthService.setAccessToken, access_token);
  yield call(AuthService.setAccessTokenExpirationDate, expires_in);
  if (
    window.angular &&
    window.angular.element(global.document.body).injector()
  ) {
    window.angular
      .element(global.document.body)
      .injector()
      .get('Restangular')
      .setDefaultHeaders({ Authorization: access_token });
  }
  // Update refresh token if API sent a new one
  if (refresh_token) {
    log.debug(`Store refresh token ${refresh_token}`);
    yield call(AuthService.setRefreshToken, refresh_token);
    yield call(AuthService.setRefreshTokenExpirationDate, expires_in);
  }

  yield put(logIn.success(access_token));
  return response;
}

function* authorizeLoop(
  credentialsOrRefreshToken,
  isAuthenticated = false,
  canAuthenticate = false,
  isNewLogin = false,
) {
  try {
    let refreshToken;
    if (isAuthenticated || canAuthenticate) {
      refreshToken = yield call(AuthService.getRefreshToken);
    }
    if (!isAuthenticated && canAuthenticate) {
      if (refreshToken) {
        yield call(authorize, { refreshToken });
      }
      refreshToken = yield call(AuthService.getRefreshToken);
    } else if (isNewLogin) {
      try {
        refreshToken = yield call(
          AuthService.createRefreshToken,
          credentialsOrRefreshToken,
        );
      } catch (error) {
        // if expired password we catch the 401 error
        if (error.error_code === 'EXPIRED_PASSWORD_ERROR') {
          yield put(logIn.expiredPassword(error));
        } else {
          throw error;
        }
      }
      if (refreshToken) {
        yield call(authorize, { refreshToken });
      }
    } else if (!isAuthenticated && !canAuthenticate) {
      yield put(LOG_OUT);
    }
    let connectedUser;

    const connectedUserStored = yield select(getStoredConnectedUser);
    if (connectedUserStored && connectedUserStored.id) {
      connectedUser = connectedUserStored;
    } else if (refreshToken) {
      connectedUser = yield call(AuthService.getConnectedUser);
    }

    if (connectedUser) {
      const filteredConnectedUser = {
        ...connectedUser,
        workspaces: connectedUser.workspaces.map(w => {
          if (w.datamarts && w.datamarts.length) {
            w.datamarts.map(d => {
              const formatted = d;
              if (
                d.audience_segment_metrics &&
                d.audience_segment_metrics.length
              ) {
                formatted.audience_segment_metrics = d.audience_segment_metrics.filter(
                  a => a.status === 'LIVE',
                );
              }
              return formatted;
            });
          }
          return w;
        }),
      };

      yield put(setOrgFeature(global.window.MCS_CONSTANTS.FEATURES));
      MicsTagServices.addUserAccountProperty(connectedUser.id);
      MicsTagServices.setUserProperties(filteredConnectedUser);
      yield put(getConnectedUser.success(filteredConnectedUser));
      window.organisationId =
        connectedUser.workspaces[
          connectedUser.default_workspace
        ].organisation_id; // eslint-disable-line no-undef

      while (true) {
        let expiresIn;
        // check expirein variable
        expiresIn = AuthService.tokenExpiresIn(
          AuthService.getAccessTokenExpirationDate(),
        );
        log.debug(`Will refresh access token in ${expiresIn} ms`);
        yield call(delay, expiresIn);
        const storedRefreshToken = yield call(AuthService.getRefreshToken);
        log.debug(`Authorize user with refresh token ${storedRefreshToken}`);
        if (storedRefreshToken) {
          const results = yield call(authorize, {
            refreshToken: storedRefreshToken,
          });
          expiresIn = results.data.expires_in;
        }
      }
    }

    // set global variable used by angular to run Session.init(organisationId) on stateChangeStart ui router hook
  } catch (e) {
    log.error('Authorize error : ', e);
    yield call(AuthService.deleteCredentials);
    yield put(logIn.failure(e));
  }
}

function* authentication() {
  while (true) {
    const isAuthenticated = yield call(AuthService.isAuthenticated);
    const canAuthenticate = yield call(AuthService.canAuthenticate);

    let credentialsOrRefreshToken = null;
    let isNewLogin = false;
    // TODO check non expired storedRefreshToken
    // Is not logged in and has no refresh token

    if (!isAuthenticated && !canAuthenticate) {
      // Wait for LOG_IN.REQUEST
      const { payload } = yield take(LOG_IN.REQUEST);
      if (payload.remember) {
        yield call(AuthService.setRememberMe, { rememberMe: true });
      }

      credentialsOrRefreshToken = {
        email: payload.email,
        password: payload.password,
      };

      isNewLogin = true;
    } else if (!isAuthenticated && canAuthenticate) {
      credentialsOrRefreshToken = {
        refreshToken: AuthService.getRefreshToken(),
      };
    }

    const { signOutAction } = yield race({
      signOutAction: take(LOG_OUT),
      authorizeLoop: call(
        authorizeLoop,
        credentialsOrRefreshToken,
        isAuthenticated,
        canAuthenticate,
        isNewLogin,
      ),
    });

    if (signOutAction) {
      yield call(AuthService.revokeRefreshToken);
      yield call(AuthService.deleteCredentials);
      persistedStoreService.removeStringItem('store');
      if (signOutAction.meta && signOutAction.meta.redirectCb) {
        signOutAction.meta.redirectCb();
      }
    }
  }
}

function* redirectAfterLogin() {
  while (true) {
    const {
      meta: { redirect },
    } = yield take(LOG_IN.REQUEST);
    yield all([take(CONNECTED_USER.SUCCESS), take(STORE_ORG_FEATURES)]);
    redirect();
  }
}

export const loginSagas = [fork(redirectAfterLogin), fork(authentication)];

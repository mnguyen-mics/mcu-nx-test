/* eslint-disable no-constant-condition */
/* eslint-disable camelcase */
import { delay } from 'redux-saga';
import {
  getContext,
  call,
  put,
  take,
  race,
  fork,
  all,
  select,
} from 'redux-saga/effects';
import { SplitFactory } from '@splitsoftware/splitio';
import log from '../../utils/Logger';
import {
  LOG_IN,
  LOG_OUT,
  CONNECTED_USER,
  STORE_ORG_FEATURES,
} from '../action-types';
import { logIn } from './actions';
import { getConnectedUser } from '../Session/actions';
import { setOrgFeature, setClientFeature } from '../Features/actions';
import { getStoredConnectedUser } from '../Session/selectors';
import { UserProfileResource } from '../../models/directory/UserProfileResource';

function* authorize(credentialsOrRefreshToken: any) {
  const _authService = yield getContext('authService');
  const response = yield call(
    _authService.createAccessToken,
    credentialsOrRefreshToken,
  );
  const { access_token, expires_in, refresh_token } = response.data;
  yield call(_authService.setAccessToken, access_token);
  yield call(_authService.setAccessTokenExpirationDate, expires_in);
  // Update refresh token if API sent a new one
  if (refresh_token) {
    log.debug(`Store refresh token ${refresh_token}`);
    yield call(_authService.setRefreshToken, refresh_token);
    yield call(_authService.setRefreshTokenExpirationDate, expires_in);
    yield call(_authService.setIsLogged, true);
  }

  yield put(logIn.success(access_token));
  return response;
}

function* authorizeLoop(
  credentialsOrRefreshToken: any,
  isAuthenticated: boolean = false,
  canAuthenticate: boolean = false,
  isNewLogin: boolean = false,
) {
  const _authService = yield getContext('authService');
  const _micsTagService = yield getContext('micsTagService');
  try {
    let refreshToken;
    if (isAuthenticated || canAuthenticate) {
      refreshToken = yield call(_authService.getRefreshToken);
    }
    if (!isAuthenticated && canAuthenticate) {
      if (refreshToken) {
        yield call(authorize, { refreshToken });
      }
      refreshToken = yield call(_authService.getRefreshToken);
    } else if (isNewLogin) {
      try {
        refreshToken = yield call(
          _authService.createRefreshToken,
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
      yield put(LOG_OUT as any);
    }
    let connectedUser: UserProfileResource | undefined;

    const connectedUserStored = yield select(getStoredConnectedUser);
    if (connectedUserStored && connectedUserStored.id) {
      connectedUser = connectedUserStored;
    } else if (refreshToken) {
      connectedUser = yield call(_authService.getConnectedUser);
    }

    if (connectedUser) {
      const filteredConnectedUser = {
        ...connectedUser,
        workspaces: connectedUser.workspaces.map(w => {
          if (w.datamarts && w.datamarts.length) {
            w.datamarts.forEach(d => {
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

      yield put(setOrgFeature((global as any).window.MCS_CONSTANTS.FEATURES));

      const clientPromise = () =>
        new Promise((resolve, reject) => {
          const factory = SplitFactory({
            core: {
              authorizationKey: '9o6sgmo2fbk275ao4cugtnd9ch6sb3fstv1d',
              key: connectedUser!.id,
              trafficType: 'user',
            },
          });
          const client = factory.client();
          client.on(client.Event.SDK_READY, () => {
            return resolve(client);
          });
          client.on(client.Event.SDK_READY_TIMED_OUT, () => {
            return resolve(null);
          });
        });

      const clientAction = yield call(clientPromise);
      yield put(setClientFeature(clientAction));

      _micsTagService.addUserAccountProperty(connectedUser.id);
      _micsTagService.setUserProperties(filteredConnectedUser);
      yield put(getConnectedUser.success(filteredConnectedUser));
      // Set the global variable userId for Google Analytics
      // This variable is used in index.html
      (window as any).userId = connectedUser.id;
      (window as any).organisationId =
        connectedUser.workspaces[
          connectedUser.default_workspace
        ].organisation_id; // eslint-disable-line no-undef

      while (true) {
        let expiresIn;
        // check expirein variable
        expiresIn = _authService.tokenExpiresIn(
          _authService.getAccessTokenExpirationDate(),
        );
        log.debug(`Will refresh access token in ${expiresIn} ms`);
        yield call(delay, expiresIn);
        const storedRefreshToken = yield call(_authService.getRefreshToken);
        log.debug(`Authorize user with refresh token ${storedRefreshToken}`);
        if (storedRefreshToken) {
          const results = yield call(authorize, {
            refreshToken: storedRefreshToken,
          });
          expiresIn = results.data.expires_in;
        }
      }
    }

  } catch (e) {
    log.error('Authorize error : ', e);
    yield call(_authService.deleteCredentials);
    yield put(logIn.failure(e));
  }
}

function* authentication() {
  const _authService = yield getContext('authService');
  while (true) {
    const isAuthenticated = yield call(_authService.isAuthenticated);
    const canAuthenticate = yield call(_authService.canAuthenticate);

    let credentialsOrRefreshToken = null;
    let isNewLogin = false;
    // TODO check non expired storedRefreshToken
    // Is not logged in and has no refresh token

    if (!isAuthenticated && !canAuthenticate && LOG_IN.REQUEST) {
      // Wait for LOG_IN.REQUEST
      const { payload } = yield take(LOG_IN.REQUEST);

      yield call(_authService.setRememberMe, !!payload.remember);

      credentialsOrRefreshToken = {
        email: payload.email,
        password: payload.password,
      };

      isNewLogin = true;
    } else if (!isAuthenticated && canAuthenticate) {
      credentialsOrRefreshToken = {
        refreshToken: _authService.getRefreshToken(),
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
      // Global variable userId is for Google Analytics.
      // We set it to undefined in order to make difference
      // between logged in and logged out user
      (window as any).userId = undefined;
      yield call(_authService.revokeRefreshToken);
      yield call(_authService.deleteCredentials);
      yield call(_authService.setIsLogged, false);
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

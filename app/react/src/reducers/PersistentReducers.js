import AuthService from '../services/AuthService';

export function persistedState(store = {}, action) { // eslint-disable-line no-unused-vars

  const access_token = AuthService.getAccessToken() || null; // eslint-disable-line camelcase
  const refresh_token = AuthService.getRefreshToken() || null; // eslint-disable-line camelcase

  return {
    access_token,
    refresh_token,
  };
}

const PersistentReducers = {
  persistedState,
};

export {
  PersistentReducers,
};

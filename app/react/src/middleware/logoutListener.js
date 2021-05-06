import { LocalStorage } from '../services/LocalStorage.ts';

// TODO test to do this local-storage operation in saga next to LOGOUT listener
export default store => next => action => { // eslint-disable-line
  if (action.type === 'LOGOUT') {
    LocalStorage.removeItem('access_token');
    LocalStorage.removeItem('refresh_token');
  }

  return next(action);
};

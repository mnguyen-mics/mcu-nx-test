import 'whatwg-fetch';

import { CALL_API } from '../../middleware/api';

import {
  TRANSLATIONS_FETCH_REQUEST,
  TRANSLATIONS_FETCH_REQUEST_FAILURE,
  TRANSLATIONS_FETCH_REQUEST_SUCCESS
} from '../action-types';

const publicPath = PUBLIC_PATH; // eslint-disable-line no-undef

const initTranslations = (locale = 'en') => {
  return dispatch => {
    return dispatch({
      [CALL_API]: {
        method: 'get',
        localUrl: true,
        endpoint: `${publicPath}/src/assets/i18n/${locale}.json`,
        authenticated: false,
        types: [TRANSLATIONS_FETCH_REQUEST, TRANSLATIONS_FETCH_REQUEST_FAILURE, TRANSLATIONS_FETCH_REQUEST_SUCCESS]
      }
    });
  };
};

export {
  initTranslations
};

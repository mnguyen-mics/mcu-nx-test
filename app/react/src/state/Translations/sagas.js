import { takeEvery } from 'redux-saga';
import { call, fork, put } from 'redux-saga/effects';

import log from '../../utils/Logger';

import ApiService from '../../services/ApiService';

import { loadTranslations } from './actions';
import { LOAD_TRANSLATIONS } from '../action-types';
import { DEFAULT_LOCALE } from './constants';

function* fetchTranslations(userLocale) {
  try {

    let locale = userLocale;
    if (!locale) {
      locale = DEFAULT_LOCALE;
    }

    const params = {};
    const options = {
      authenticated: false,
      localUrl: true
    };
    const transations = yield call(ApiService.getRequest, `react/src/assets/i18n/${locale}.json`, params, null, options);
    yield put(loadTranslations.success(transations));
  } catch (error) {
    log.error(error);
    yield put(loadTranslations.failure(error));
  }
}

function* watchLoadTranslations() {
  yield* takeEvery(LOAD_TRANSLATIONS.REQUEST, fetchTranslations);
}

export const translationsSagas = [
  fork(watchLoadTranslations),
  fork(fetchTranslations)
];

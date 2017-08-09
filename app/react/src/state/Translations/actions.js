import { createAction } from 'redux-actions';

import {
  LOAD_TRANSLATIONS,
} from '../action-types';

const loadTranslations = {
  request: createAction(LOAD_TRANSLATIONS.REQUEST),
  success: createAction(LOAD_TRANSLATIONS.SUCCESS),
  failure: createAction(LOAD_TRANSLATIONS.FAILURE),
};

export {
  loadTranslations,
};

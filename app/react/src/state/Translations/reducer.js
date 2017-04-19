import {
  TRANSLATIONS_FETCH_REQUEST,
  TRANSLATIONS_FETCH_REQUEST_FAILURE,
  TRANSLATIONS_FETCH_REQUEST_SUCCESS
} from '../action-types';

const defaultTranslationsState = {
  isLoading: false,
  isReady: false,
  translations: {}
};

const translationsState = (state = defaultTranslationsState, action) => {

  switch (action.type) {
    case TRANSLATIONS_FETCH_REQUEST:
      return {
        ...state,
        isReady: false,
        isLoading: true
      };
    case TRANSLATIONS_FETCH_REQUEST_SUCCESS:
      return {
        ...state,
        translations: action.response,
        isReady: true,
        isLoading: false
      };
    case TRANSLATIONS_FETCH_REQUEST_FAILURE:
      return {
        ...state,
        isReady: false,
        isLoading: false
      };
    default:
      return state;
  }

};

const TranslationsReducers = {
  translationsState
};

export default TranslationsReducers;

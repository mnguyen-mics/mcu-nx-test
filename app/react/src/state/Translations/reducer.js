import {
  LOAD_TRANSLATIONS,
} from '../action-types';

const translations = (state = {}, action) => {

  switch (action.type) {
    case LOAD_TRANSLATIONS.SUCCESS:
      return {
        ...action.payload,
      };
    default:
      return state;
  }

};

const TranslationsReducers = {
  translations,
};

export default TranslationsReducers;

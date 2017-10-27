import {
  STORE_THEME_COLOR,
  } from '../action-types';

const theme = (state = {
  colors: {},
}, action) => {
  switch (action.type) {
    case STORE_THEME_COLOR:
      return {
        ...state,
        colors: action.payload,
      };
    default:
      return state;
  }
};

const ThemeReducer = {
  theme,
};

export default ThemeReducer;


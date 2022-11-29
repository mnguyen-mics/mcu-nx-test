import { STORE_THEME_COLOR } from '../action-types';
import { Action } from 'redux-actions';
import { Payload } from '@mediarithmics-private/advanced-components/lib/utils/ReduxHelper';

const theme = (
  state = {
    colors: {},
  },
  action: Action<Payload>,
) => {
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

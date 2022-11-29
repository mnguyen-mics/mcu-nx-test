import { MENU_OPEN_CLOSE } from '../action-types';
import { Action } from 'redux-actions';
import { Payload } from '@mediarithmics-private/advanced-components/lib/utils/ReduxHelper';

const openMenuDefaultState = {
  collapsed: localStorage.getItem('collapsed_menu') === 'true',
  mode: localStorage.getItem('collapsed_menu') === 'true' ? 'vertical' : 'inline',
};

const menu = (state = openMenuDefaultState, action: Action<Payload>) => {
  switch (action.type) {
    case MENU_OPEN_CLOSE:
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
};

const MenuReducers = {
  menu,
};

export default MenuReducers;

import { MENU_OPEN_CLOSE } from '../action-types';
import { Action } from 'redux-actions';
import { Payload } from '../../utils/ReduxHelper';

const openMenuDefaultState = {
  collapsed: false,
  mode: 'inline',
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

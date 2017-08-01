import { createAction } from 'redux-actions';

import {
  MENU_OPEN_CLOSE,
 } from '../action-types';

const openCloseMenu = params => createAction(MENU_OPEN_CLOSE)(params);

export {
  openCloseMenu,
};

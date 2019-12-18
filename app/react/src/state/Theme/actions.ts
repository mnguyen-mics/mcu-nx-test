import { createAction } from 'redux-actions';

import { STORE_THEME_COLOR } from '../action-types';

const setColorsStore = createAction(STORE_THEME_COLOR);

export { setColorsStore };

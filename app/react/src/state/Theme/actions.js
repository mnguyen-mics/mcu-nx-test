import { createAction } from 'redux-actions';

import {
    STORE_COLOR,
} from '../action-types';

const setColorsStore = createAction(STORE_COLOR);


export {
    setColorsStore,
};

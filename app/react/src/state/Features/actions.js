import { createAction } from 'redux-actions';

import {
    STORE_ORG_FEATURES,
} from '../action-types';

const setOrgFeature = createAction(STORE_ORG_FEATURES);


export {
    setOrgFeature,
};

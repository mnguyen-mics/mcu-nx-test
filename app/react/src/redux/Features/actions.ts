import { createAction } from 'redux-actions';

import { STORE_ORG_FEATURES, STORE_FEATURE_FLAG_CLIENT } from '../action-types';

const setOrgFeature = createAction(STORE_ORG_FEATURES);
const setClientFeature = createAction(STORE_FEATURE_FLAG_CLIENT);

export { setOrgFeature, setClientFeature };

import { createAction } from 'redux-actions';

import { EMAIL_ROUTER_LIST_FETCH } from '../action-types';

const fetchEmailRouters = {
  request: createAction(EMAIL_ROUTER_LIST_FETCH.REQUEST),
  success: createAction(EMAIL_ROUTER_LIST_FETCH.SUCCESS),
  failure: createAction(EMAIL_ROUTER_LIST_FETCH.FAILURE),
};

export { fetchEmailRouters };

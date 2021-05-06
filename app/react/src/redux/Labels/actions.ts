import { createAction } from 'redux-actions';

import { LABELS_FETCH, LABELS_RESET } from '../action-types';

const fetchAllLabels = {
  request: (organisationId: string) => createAction(LABELS_FETCH.REQUEST)({ organisationId }),
  success: createAction(LABELS_FETCH.SUCCESS),
  failure: createAction(LABELS_FETCH.FAILURE),
};

const resetLabels = createAction(LABELS_RESET);

export { fetchAllLabels, resetLabels };

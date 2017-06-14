import { createAction } from '../../utils/ReduxHelper';

import {
  LABELS_OBJECT_FETCH,
  LABELS_FETCH,
  LABELS_CREATE,
  LABELS_UPDATE,
  LABELS_PAIR,
  LABELS_UNPAIR,
  LABELS_RESET
} from '../action-types';

const fetchAllLabels = {
  request: (organisationId) => createAction(LABELS_FETCH.REQUEST)({ organisationId }),
  success: createAction(LABELS_FETCH.SUCCESS),
  failure: createAction(LABELS_FETCH.FAILURE)
};

const fetchLabelsOfObjects = {
  request: (organisationId, labelableType = '', labelableId = '') => createAction(LABELS_OBJECT_FETCH.REQUEST)({ organisationId, labelableType, labelableId }),
  success: createAction(LABELS_OBJECT_FETCH.SUCCESS),
  failure: createAction(LABELS_OBJECT_FETCH.FAILURE)
};

const createLabels = {
  request: (name, organisationId) => createAction(LABELS_CREATE.REQUEST)({ name, organisationId }),
  success: createAction(LABELS_CREATE.SUCCESS),
  failure: createAction(LABELS_CREATE.FAILURE)
};

const pairLabelWithObject = {
  request: (labelId, organisationId, labellableType, objectId) => createAction(LABELS_PAIR.REQUEST)({ labelId, organisationId, labellableType, objectId }),
  success: createAction(LABELS_PAIR.SUCCESS),
  failure: createAction(LABELS_PAIR.FAILURE)
};

const unPairLabelWithObject = {
  request: (labelId, organisationId, labellableType, objectId) => createAction(LABELS_UNPAIR.REQUEST)({ labelId, organisationId, labellableType, objectId }),
  success: createAction(LABELS_UNPAIR.SUCCESS),
  failure: createAction(LABELS_UNPAIR.FAILURE)
};

const updateLabels = {
  request: (campaignId, name) => createAction(LABELS_UPDATE.REQUEST)({ campaignId, name }),
  success: createAction(LABELS_UPDATE.SUCCESS),
  failure: createAction(LABELS_UPDATE.FAILURE)
};

const resetLabels = createAction(LABELS_RESET);

export {
  fetchAllLabels,
  fetchLabelsOfObjects,
  createLabels,
  pairLabelWithObject,
  unPairLabelWithObject,
  updateLabels,
  resetLabels
};

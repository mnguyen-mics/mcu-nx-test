import { createAction } from '../../../utils/ReduxHelper';

import {
  EMAIL_BLAST_FETCH_ALL,
  EMAIL_BLAST_ARCHIVE,
  EMAIL_BLAST_FETCH,
  EMAIL_BLAST_DELIVERY_REPORT_FETCH,
  EMAIL_BLAST_LOAD_ALL,
  EMAIL_BLAST_UPDATE,
  EMAIL_BLAST_RESET
} from '../../action-types';

const fetchAllEmailBlast = {
  request: blastId => createAction(EMAIL_BLAST_FETCH_ALL.REQUEST)(),
  success: createAction(EMAIL_BLAST_FETCH_ALL.SUCCESS),
  failure: createAction(EMAIL_BLAST_FETCH_ALL.FAILURE)
};

const fetchEmailBlast = {
  request: blastId => createAction(EMAIL_BLAST_FETCH.REQUEST)({ blastId }),
  success: createAction(EMAIL_BLAST_FETCH.SUCCESS),
  failure: createAction(EMAIL_BLAST_FETCH.FAILURE)
};

const fetchEmailBlastDeliveryReport = {
  request: (blastId, filter = {}) => createAction(EMAIL_BLAST_DELIVERY_REPORT_FETCH.REQUEST)({ blastId, filter }),
  success: createAction(EMAIL_BLAST_DELIVERY_REPORT_FETCH.SUCCESS),
  failure: createAction(EMAIL_BLAST_DELIVERY_REPORT_FETCH.FAILURE)
};

const loadEmailBlastAndDeliveryReport = (blastId, filter) => createAction(EMAIL_BLAST_LOAD_ALL)({ blastId, filter });

const archiveEmailBlast = {
  request: (blastId, body) => createAction(EMAIL_BLAST_ARCHIVE.REQUEST)({ blastId, body }),
  success: createAction(EMAIL_BLAST_ARCHIVE.SUCCESS),
  failure: createAction(EMAIL_BLAST_ARCHIVE.FAILURE)
};

const updateEmailBlast = {
  request: (blastId, body) => createAction(EMAIL_BLAST_UPDATE.REQUEST)({ blastId, body }),
  success: createAction(EMAIL_BLAST_UPDATE.SUCCESS),
  failure: createAction(EMAIL_BLAST_UPDATE.FAILURE)
};

const resetEmailBlast = createAction(EMAIL_BLAST_RESET);

export {
  fetchAllEmailBlast,
  fetchEmailBlast,
  fetchEmailBlastDeliveryReport,
  loadEmailBlastAndDeliveryReport,
  archiveEmailBlast,
  updateEmailBlast,
  resetEmailBlast
};

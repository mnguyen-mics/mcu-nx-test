import { combineReducers } from 'redux';

import {
  EMAIL_BLAST_ARCHIVE,
  EMAIL_BLAST_FETCH,
  EMAIL_BLAST_UPDATE,
  EMAIL_BLAST_DELIVERY_REPORT_FETCH,
  EMAIL_BLAST_RESET
} from '../../action-types';

const defaultEmailBlastState = {
  emailBlast: {},
  isFetching: false,
  isUpdating: false,
  isArchiving: false
};

const emailBlastApi = (state = defaultEmailBlastState, action) => {
  switch (action.type) {
    case EMAIL_BLAST_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case EMAIL_BLAST_FETCH.SUCCESS:
      return {
        ...state,
        emailBlast: action.payload.data,
        isFetching: false
      };
    case EMAIL_BLAST_FETCH.FAILURE:
      return {
        ...state,
        emailBlast: defaultEmailBlastState.emailBlast,
        isFetching: false
      };

    case EMAIL_BLAST_RESET:
      return defaultEmailBlastState;
    default:
      return state;
  }
};

const defaultEmailBlastReportState = {
  isFetching: false,
  hasFetched: false,
  report_view: {
    items_per_page: 0,
    total_items: 0,
    columns_headers: [],
    rows: []
  }
};

const emailBlastPerformance = (state = defaultEmailBlastReportState, action) => {
  switch (action.type) {
    case EMAIL_BLAST_DELIVERY_REPORT_FETCH.REQUEST:
      return {
        ...state,
        isFetching: true
      };
    case EMAIL_BLAST_DELIVERY_REPORT_FETCH.SUCCESS:
      return {
        ...state,
        ...action.payload.data,
        isFetching: false,
        hasFetched: true
      };
    case EMAIL_BLAST_DELIVERY_REPORT_FETCH.FAILURE:
      return {
        ...state,
        isFetching: false,
        hasFetched: true
      };

    case EMAIL_BLAST_RESET:
      return defaultEmailBlastReportState;
    default:
      return state;
  }
};


const emailBlastSingle = combineReducers({
  emailBlastApi,
  emailBlastPerformance
});

const CampaignEmailReducers = {
  emailBlastSingle
};

export default CampaignEmailReducers;

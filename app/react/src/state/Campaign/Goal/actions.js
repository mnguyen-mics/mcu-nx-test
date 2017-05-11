import { CALL_API } from '../../../middleware/api';

import {
  GOAL_ARCHIVE_REQUEST,
  GOAL_ARCHIVE_REQUEST_FAILURE,
  GOAL_ARCHIVE_REQUEST_SUCCESS,
  GOAL_UPDATE_REQUEST,
  GOAL_UPDATE_REQUEST_FAILURE,
  GOAL_UPDATE_REQUEST_SUCCESS,
  GOAL_RESET
} from '../../action-types';

const updateGoal = (id, body) => {
  return (dispatch, getState) => { // eslint-disable-line consistent-return

    const { goalState } = getState();

    if (goalState.isUpdating) {
      return Promise.resolve();
    }

    return dispatch({
      [CALL_API]: {
        method: 'put',
        endpoint: `goals/${id}`,
        body,
        authenticated: true,
        types: [GOAL_UPDATE_REQUEST, GOAL_UPDATE_REQUEST_FAILURE, GOAL_UPDATE_REQUEST_SUCCESS]
      }
    });
  };
};

const archiveGoal = (id) => {
  return (dispatch, getState) => { // eslint-disable-line consistent-return
    const { goalState } = getState();

    if (goalState.isArchiving) {
      return Promise.resolve();
    }

    const body = {
      archived: true
    };

    dispatch({ type: GOAL_ARCHIVE_REQUEST });
    return dispatch(updateGoal(id, body)).then((updatedGoal) => {
      dispatch({ type: GOAL_ARCHIVE_REQUEST_SUCCESS });
      return updatedGoal;
    }).catch(() => { dispatch({ type: GOAL_ARCHIVE_REQUEST_FAILURE }); });

  };
};

const resetGoal = () => {
  return (dispatch) => {
    return dispatch({
      type: GOAL_RESET
    });
  };
};

export {
  archiveGoal,
  updateGoal,
  resetGoal
};

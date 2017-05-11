import {
  GOAL_ARCHIVE_REQUEST,
  GOAL_ARCHIVE_REQUEST_FAILURE,
  GOAL_ARCHIVE_REQUEST_SUCCESS,
  GOAL_UPDATE_REQUEST,
  GOAL_UPDATE_REQUEST_FAILURE,
  GOAL_UPDATE_REQUEST_SUCCESS,
  GOAL_RESET
} from '../../action-types';

const defaultGoalState = {
  isUpdating: false,
  isArchiving: false
};

const goalState = (state = defaultGoalState, action) => {
  switch (action.type) {
    case GOAL_UPDATE_REQUEST:
      return {
        ...state,
        isUpdating: true
      };
    case GOAL_ARCHIVE_REQUEST:
      return {
        ...state,
        isArchiving: true
      };
    case GOAL_UPDATE_REQUEST_FAILURE:
      return {
        ...state,
        isUpdating: false
      };
    case GOAL_ARCHIVE_REQUEST_FAILURE:
      return {
        ...state,
        isArchiving: false
      };
    case GOAL_UPDATE_REQUEST_SUCCESS:
      return {
        ...state,
        isUpdating: false
      };
    case GOAL_ARCHIVE_REQUEST_SUCCESS:
      return {
        ...state,
        isArchiving: false
      };
    case GOAL_RESET:
      return defaultGoalState;
    default:
      return state;
  }
};

const GoalReducers = {
  goalState
};

export default GoalReducers;

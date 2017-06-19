import {
  CONNECTED_USER,
  WORKSPACE,
  LOG_OUT
} from '../action-types';

const defaultSessionState = {
  workspace: {
    datamarts: []
  },
  connectedUser: {
    workspaces: []
  },
  isFetchingWorkspace: false,
  connectedUserLoaded: false
};

const session = (state = defaultSessionState, action) => {
  switch (action.type) {
    case CONNECTED_USER.SUCCESS:
      return {
        ...state,
        connectedUserLoaded: true,
        connectedUser: { ...action.payload }
      };
    case WORKSPACE.REQUEST:
      return {
        ...state,
        isFetchingWorkspace: true
      };
    case WORKSPACE.SUCCESS:
      return {
        ...state,
        isFetchingWorkspace: false,
        workspace: { ...action.payload }
      };
    case WORKSPACE.FAILURE:
      return {
        ...state,
        isFetchingWorkspace: false
      };
    case LOG_OUT:
      return defaultSessionState;
    default:
      return state;
  }
};

const SessionReducers = {
  session
};

export default SessionReducers;

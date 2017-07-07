import {
  CONNECTED_USER,
  WORKSPACE,
  LOG_OUT,
  PUT_LOGO
} from '../action-types';

const defaultSessionState = {
  workspace: {
    datamarts: []
  },
  connectedUser: {
    workspaces: []
  },
  isFetchingWorkspace: false,
  isUploadingLogo: false

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
    case PUT_LOGO.REQUEST:
      return {
        ...state,
        isUploadingLogo: true
      };
    case PUT_LOGO.FAILURE:
      return {
        ...state,
        isUploadingLogo: false
      };
    case PUT_LOGO.SUCCESS:
      return {
        ...state,
        isUploadingLogo: false
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

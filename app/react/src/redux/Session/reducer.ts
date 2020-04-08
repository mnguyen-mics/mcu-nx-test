import {
  CONNECTED_USER,
  WORKSPACE,
  LOG_OUT,
  FETCH_COOKIES,
  PUT_LOGO,
  GET_LOGO,
} from '../action-types';
import { Action } from 'redux-actions';
import { Payload } from '../../utils/ReduxHelper';

const defaultSessionState = {
  workspace: {
    datamarts: [],
  },
  connectedUser: {
    workspaces: [],
  },
  cookies: {
    mics_lts: '',
    mics_uaid: '',
    mics_vid: '',
  },
  connectedUserLoaded: false,
  isFechingCookies: true,
  isFetchingWorkspace: false,
  isUploadingLogo: false,
};

const session = (state = defaultSessionState, action: Action<Payload>) => {
  switch (action.type) {
    case CONNECTED_USER.SUCCESS:
      return {
        ...state,
        connectedUserLoaded: true,
        connectedUser: {
          ...action.payload,
          workspaces: action.payload.workspaces,
        },
      };
    case WORKSPACE.REQUEST:
      return {
        ...state,
        isFetchingWorkspace: true,
      };
    case WORKSPACE.SUCCESS:
      return {
        ...state,
        isFetchingWorkspace: false,
        workspace: { ...action.payload },
      };
    case WORKSPACE.FAILURE:
      return {
        ...state,
        isFetchingWorkspace: false,
      };
    case FETCH_COOKIES.REQUEST:
      return {
        ...state,
        isFechingCookies: true,
      };
    case FETCH_COOKIES.SUCCESS:
      return {
        ...state,
        isFechingCookies: false,
        cookies: { ...action.payload.cookies },
      };
    case FETCH_COOKIES.FAILURE:
      return {
        ...state,
        isFechingCookies: false,
        cookies: { ...action.payload },
      };
    case GET_LOGO.SUCCESS:
      return {
        ...state,
        logoUrl: action.payload.logoUrl,
      };
    case PUT_LOGO.REQUEST:
      return {
        ...state,
        isUploadingLogo: true,
      };
    case PUT_LOGO.FAILURE:
      return {
        ...state,
        isUploadingLogo: false,
      };
    case PUT_LOGO.SUCCESS:
      return {
        ...state,
        isUploadingLogo: false,
      };
    case LOG_OUT:
      return defaultSessionState;
    default:
      return state;
  }
};

const SessionReducers = {
  session,
};

export default SessionReducers;

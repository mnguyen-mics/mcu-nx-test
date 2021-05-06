import { Cookies } from './../models/timeline/timeline';
import { DrawableContent } from './../components/Drawer/index';
import { Label } from './../containers/Labels/Labels';
import { Action } from 'redux-actions';
import { ThemeColorsShape } from '../containers/Helpers/injectThemeColors';
import {
  UserWorkspaceResource,
  UserProfileResource,
} from '../models/directory/UserProfileResource';
import { Notification } from '../containers/Notifications/Notifications';

const REQUEST = 'REQUEST';
const SUCCESS = 'SUCCESS';
const FAILURE = 'FAILURE';
const EXPIRED_PASSWORD = 'EXPIRED_PASSWORD';

export interface CreateRequestType {
  REQUEST: string;
  SUCCESS: string;
  FAILURE: string;
  EXPIRED_PASSWORD: string;
}

export type MicsReduxState = {
  form: {
    [key: string]: any; // find a way to type all forms
  };
  app: {
    initialized: boolean;
    initializationError: boolean;
  };
  theme: {
    colors: ThemeColorsShape;
  };
  features: {
    organisation: string[];
    client: string;
  };
  notifications: Notification[];
  login: {
    hasError: boolean;
    error: any; // ?
  };
  session: {
    workspace: UserWorkspaceResource;
    connectedUser: UserProfileResource;
    cookies: Cookies;
    connectedUserLoaded: boolean;
    isFechingCookies: boolean;
    isFetchingWorkspace: boolean;
    isUploadingLogo: boolean;
    logoUrl: string;
  };
  labels: {
    labelsApi: {
      isFetching: boolean;
      data: Label[];
      total: number;
      status: string;
      count: number;
      first_result: number;
      max_result: number;
      max_results: number;
    };
  };
  menu: {
    collapsed: boolean;
    mode: string;
  };
  DrawableContents: DrawableContent[];
};

export type Payload = { [key: string]: any };

type RequestType = (base: string) => CreateRequestType;

export const createRequestTypes: RequestType = (base: string) => {
  return [REQUEST, SUCCESS, FAILURE, EXPIRED_PASSWORD].reduce(
    (acc, type) => ({
      ...acc,
      [type]: `${base}_${type}`,
    }),
    {
      REQUEST: '',
      SUCCESS: '',
      FAILURE: '',
      EXPIRED_PASSWORD: '',
    },
  );
};

const defaultMetadata = {
  isFetching: false,
  error: false,
  total: 0,
};

export const createRequestMetadataReducer = (requestTypes: CreateRequestType) => (
  state = defaultMetadata,
  action: Action<Payload>,
) => {
  switch (action.type) {
    case requestTypes.REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case requestTypes.SUCCESS:
      return {
        ...state,
        isFetching: false,
        total: action.payload.total,
      };
    case requestTypes.FAILURE:
      return {
        ...state,
        isFetching: false,
        error: action.payload,
      };
    case requestTypes.EXPIRED_PASSWORD:
      return {
        ...state,
        isFetching: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

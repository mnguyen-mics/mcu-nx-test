import { combineReducers } from 'redux';

import FormReducer from './FormReducer';

import AppReducer from '../state/App/reducer';
import ThemeReducer from '../state/Theme/reducer';
import FeaturesReducer from '../state/Features/reducer';
import NotificationsReducers from '../state/Notifications/reducer';
import LoginReducers from '../state/Login/reducer';
import SessionReducers from '../state/Session/reducer';
import LabelsReducers from '../state/Labels/reducer';
import MenuReducers from '../state/Menu/reducer';
import creativesReducer from '../state/Creatives/reducer';
import { drawerReducer } from '../components/Drawer/DrawerStore.ts';

const allReducers = Object.assign(
  {},
  FormReducer,
  AppReducer,
  ThemeReducer,
  FeaturesReducer,
  NotificationsReducers,
  LoginReducers,
  SessionReducers,
  LabelsReducers,
  MenuReducers,
  creativesReducer,
  drawerReducer,
);

export default combineReducers(allReducers);

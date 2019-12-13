import { combineReducers } from 'redux';
import FormReducer from './FormReducer';
import AppReducer from '../state/App/reducer.ts';
import ThemeReducer from '../state/Theme/reducer.ts';
import FeaturesReducer from '../state/Features/reducer.ts';
import NotificationsReducers from '../state/Notifications/reducer.ts';
import LoginReducers from '../state/Login/reducer.ts';
import SessionReducers from '../state/Session/reducer.ts';
import LabelsReducers from '../state/Labels/reducer.ts';
import MenuReducers from '../state/Menu/reducer.ts';
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
  drawerReducer,
);

export default combineReducers(allReducers);

import { combineReducers } from 'redux';
import FormReducer from './FormReducer';
import AppReducer from '../redux/App/reducer.ts';
import ThemeReducer from '../redux/Theme/reducer.ts';
import FeaturesReducer from '../redux/Features/reducer.ts';
import NotificationsReducers from '../redux/Notifications/reducer.ts';
import LoginReducers from '../redux/Login/reducer.ts';
import SessionReducers from '../redux/Session/reducer.ts';
import LabelsReducers from '../redux/Labels/reducer.ts';
import MenuReducers from '../redux/Menu/reducer.ts';
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

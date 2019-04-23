import { combineReducers } from 'redux';

import FormReducer from './FormReducer';

import AppReducer from '../state/App/reducer';
import ThemeReducer from '../state/Theme/reducer';
import FeaturesReducer from '../state/Features/reducer';
import DisplayCampaignsReducers from '../state/Campaigns/Display/reducer';
import GoalsReducers from '../state/Campaigns/Goal/reducer';
import GoalReducers from '../state/Campaign/Goal/reducer';
import NotificationsReducers from '../state/Notifications/reducer';
import LoginReducers from '../state/Login/reducer';
import SessionReducers from '../state/Session/reducer';
import TranslationsReducers from '../state/Translations/reducer';
import AutomationListReducers from '../state/Automations/reducer';
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
  DisplayCampaignsReducers,
  GoalsReducers,
  GoalReducers,
  NotificationsReducers,
  LoginReducers,
  SessionReducers,
  TranslationsReducers,
  AutomationListReducers,
  LabelsReducers,
  MenuReducers,
  creativesReducer,
  drawerReducer,
);

export default combineReducers(allReducers);

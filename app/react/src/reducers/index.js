import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { routerReducer } from 'react-router-redux';

import { PersistentReducers } from './PersistentReducers';

import ActionbarReducers from '../state/Actionbar/reducer';
import CampaignsDisplayReducers from '../state/Campaigns/Display/reducer';
import HeaderReducers from '../state/Header/reducer';
import LoginReducers from '../state/Login/reducer';
import SessionReducers from '../state/Session/reducer';
import SidebarReducers from '../state/Sidebar/reducer';
import TranslationsReducers from '../state/Translations/reducer';

const allReducers = Object.assign(
  {},

  // external reducers
  {
    form: formReducer,
    routing: routerReducer,
  },

  PersistentReducers,
  ActionbarReducers,
  CampaignsDisplayReducers,
  HeaderReducers,
  LoginReducers,
  SessionReducers,
  SidebarReducers,
  TranslationsReducers
);

export default combineReducers(allReducers);

import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

// import { PersistentReducers } from './PersistentReducers';

import AppReducer from '../state/App/reducer';
import CampaignsDisplayReducers from '../state/Campaigns/Display/reducer';
import CampaignEmailReducers from '../state/Campaign/Email/reducer';
import CampaignsEmailReducers from '../state/Campaigns/Email/reducer';
import GoalsReducers from '../state/Campaigns/Goal/reducer';
import GoalReducers from '../state/Campaign/Goal/reducer';
import NotificationsReducers from '../state/Notifications/reducer';
import LoginReducers from '../state/Login/reducer';
import ForgotPasswordReducers from '../state/ForgotPassword/reducer';
import SessionReducers from '../state/Session/reducer';
import TranslationsReducers from '../state/Translations/reducer';
import AudienceSegmentsReducers from '../state/Audience/Segments/reducer';
import AudiencePartitionsReducers from '../state/Audience/Partitions/reducer';
import AutomationListReducers from '../state/Automations/reducer';
import LabelsReducers from '../state/Labels/reducer';

import MenuReducers from '../state/Menu/reducer';

import PlacementListsReducers from '../state/Library/PlacementLists/reducer';
import KeywordListsReducers from '../state/Library/KeywordLists/reducer';
import creativeDisplayReducers from '../state/Creatives/Display/reducer';
import creativeEmailsReducers from '../state/Creatives/Emails/reducer';
import AssetsFilesReducers from '../state/Library/AssetsFiles/reducer';

const allReducers = Object.assign(
  {},

  // external reducers
  {
    form: formReducer
  },

  // PersistentReducers,
  AppReducer,
  CampaignsDisplayReducers,
  CampaignEmailReducers,
  CampaignsEmailReducers,
  GoalsReducers,
  GoalReducers,
  NotificationsReducers,
  LoginReducers,
  ForgotPasswordReducers,
  SessionReducers,
  TranslationsReducers,
  AudienceSegmentsReducers,
  AutomationListReducers,
  LabelsReducers,
  AudiencePartitionsReducers,
  PlacementListsReducers,
  KeywordListsReducers,
  AssetsFilesReducers,
  creativeDisplayReducers,
  creativeEmailsReducers,
  MenuReducers
);

export default combineReducers(allReducers);

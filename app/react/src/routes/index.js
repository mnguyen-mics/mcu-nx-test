/* eslint-disable no-undef */

import React from 'react';
import Route from 'react-router/lib/Route';

import { requireAuthentication } from '../components/AuthenticatedComponent';
import { Navigator } from '../containers/Navigator';
import { NotFound } from '../containers/NotFound';
import { ContentView } from '../containers/ContentView';

import CampaignsRouter from './Campaigns';
import AudienceRouter from './Audience';
import AutomationsRouter from './Automations';
import LibraryRouter from './Library';
import CampaignRouter from './Campaign';
import CreativeRouter from './Creatives';
import LoginRouter from './Login';


// Dumb component to display when angular handle the app
class NoMatch extends React.Component {
  render() {
    return null;
  }
}

export default (store) => { // eslint-disable-line no-unused-vars
  return (
    <Route path="/" component={Navigator}>
      <Route path={`${PUBLIC_URL}/o/:organisationId(/d/:datamartId)`} component={requireAuthentication(ContentView)}>
        { CampaignsRouter }
        { CampaignRouter }
        { AudienceRouter }
        { AutomationsRouter }
        { LibraryRouter }
        { CreativeRouter }
        <Route path="*" component={NotFound} />
      </Route>
      <Route path={`${PUBLIC_URL}`} component={ContentView}>
        {LoginRouter(store)}
        <Route path="*" component={NotFound} />
      </Route>
      <Route path="*" component={NoMatch} />
    </Route>
  );
};

/* eslint-disable no-undef */

import React from 'react';
import Route from 'react-router/lib/Route';

import { requireAuthentication } from '../components/AuthenticatedComponent';
import { Navigator } from '../containers/Navigator';
import { NotFound } from '../containers/NotFound';
import { ContentView } from '../containers/ContentView';

import CampaignsRouter from './Campaigns';
import CampaignRouter from './Campaign';
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

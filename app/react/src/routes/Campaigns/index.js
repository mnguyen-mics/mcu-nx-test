import React from 'react';
import Route from 'react-router/lib/Route';

import {
  DISPLAY_QUERY_SETTINGS,
  EMAIL_QUERY_SETTINGS,
  GOAL_QUERY_SETTINGS,
  CAMPAIGN_EMAIL_QUERY_SETTINGS,
  isQueryValid,
  buildDefaultQuery
} from '../../containers/Campaigns/RouteQuerySelector';

import {
  Campaigns,
  CampaignsDisplay,
  CampaignsEmail,
  Goals,
  CampaignEmail
 } from '../../containers/Campaigns';

const handleOnEnter = (nextState, replace, settings) => {
  if (!isQueryValid(nextState.location.query, settings)) {
    replace({
      pathname: nextState.location.pathname,
      query: buildDefaultQuery(nextState.location.query, settings)
    });
  }
};

const handleOnChange = (prevState, nextState, replace, settings) => {
  if (!isQueryValid(nextState.location.query, settings)) {
    replace({
      pathname: prevState.location.pathname,
      query: prevState.location.query
    });
  }
};

export default (
  <div>
    <Route path="campaigns" component={Campaigns} >
      <Route
        path="display"
        component={CampaignsDisplay}
        onEnter={(nextState, replace) => handleOnEnter(nextState, replace, DISPLAY_QUERY_SETTINGS)}
        onChange={(prevState, nextState, replace) => handleOnChange(prevState, nextState, replace, DISPLAY_QUERY_SETTINGS)}
      />
      <Route
        path="email"
        component={CampaignsEmail}
        onEnter={(nextState, replace) => handleOnEnter(nextState, replace, EMAIL_QUERY_SETTINGS)}
        onChange={(prevState, nextState, replace) => handleOnChange(prevState, nextState, replace, EMAIL_QUERY_SETTINGS)}
      />
      <Route
        path="email/:campaignId"
        component={CampaignEmail}
        onEnter={(nextState, replace) => handleOnEnter(nextState, replace, CAMPAIGN_EMAIL_QUERY_SETTINGS)}
        onChange={(prevState, nextState, replace) => handleOnChange(prevState, nextState, replace, CAMPAIGN_EMAIL_QUERY_SETTINGS)}
      />
      <Route
        path="goal"
        component={Goals}
        onEnter={(nextState, replace) => handleOnEnter(nextState, replace, GOAL_QUERY_SETTINGS)}
        onChange={(prevState, nextState, replace) => handleOnChange(prevState, nextState, replace, GOAL_QUERY_SETTINGS)}
      />
    </Route>
  </div>
);

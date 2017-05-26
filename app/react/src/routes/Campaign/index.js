import React from 'react';
import Route from 'react-router/lib/Route';

import {
  CAMPAIGN_EMAIL_QUERY_SETTINGS
} from '../../containers/Campaign/RouteQuerySelector';

import {
  isQueryValid,
  buildDefaultQuery
} from '../../services/RouteQuerySelectorService';

import {
  Campaigns as Campaign,
  EditCampaign
} from '../../containers/Campaigns';

import {
  CampaignEmail
} from '../../containers/Campaign';

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
    <Route path="campaign" component={Campaign} >
      <Route path="email" >
        <Route
          path=":campaignId"
          component={CampaignEmail}
          onEnter={(nextState, replace) => handleOnEnter(nextState, replace, CAMPAIGN_EMAIL_QUERY_SETTINGS)}
          onChange={(prevState, nextState, replace) => handleOnChange(prevState, nextState, replace, CAMPAIGN_EMAIL_QUERY_SETTINGS)}
        />
      </Route>
    </Route>
  </div>
);

import React from 'react';
import Route from 'react-router/lib/Route';

import {
  CREATIVE_DISPLAY_LIST_SETTINGS,
  CREATIVE_EMAILS_LIST_SETTINGS,

  isQueryValid,
  buildDefaultQuery
} from '../../containers/Creative/RouteQuerySelector';

import { DisplayAds, Creative, EmailTemplates } from '../../containers/Creative';

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
    <Route path="creatives" component={Creative} >
      <Route
        path="display"
        component={DisplayAds}
        onEnter={(nextState, replace) => handleOnEnter(nextState, replace, CREATIVE_DISPLAY_LIST_SETTINGS)}
        onChange={(prevState, nextState, replace) => handleOnChange(prevState, nextState, replace, CREATIVE_DISPLAY_LIST_SETTINGS)}
      />
      <Route
        path="emails"
        component={EmailTemplates}
        onEnter={(nextState, replace) => handleOnEnter(nextState, replace, CREATIVE_EMAILS_LIST_SETTINGS)}
        onChange={(prevState, nextState, replace) => handleOnChange(prevState, nextState, replace, CREATIVE_EMAILS_LIST_SETTINGS)}
      />
    </Route>
  </div>
);

import React from 'react';
import Route from 'react-router/lib/Route';

import {
  PLACEMENT_LISTS_SETTINGS,
  KEYWORD_LISTS_SETTINGS,

  isQueryValid,
  buildDefaultQuery
} from '../../containers/Library/RouteQuerySelector';

import { Library, Placements, Keywords } from '../../containers/Library';

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
    <Route path="library" component={Library} >
      <Route
        path="placements"
        component={Placements}
        onEnter={(nextState, replace) => handleOnEnter(nextState, replace, PLACEMENT_LISTS_SETTINGS)}
        onChange={(prevState, nextState, replace) => handleOnChange(prevState, nextState, replace, PLACEMENT_LISTS_SETTINGS)}
      />
      <Route
        path="keywords"
        component={Keywords}
        onEnter={(nextState, replace) => handleOnEnter(nextState, replace, KEYWORD_LISTS_SETTINGS)}
        onChange={(prevState, nextState, replace) => handleOnChange(prevState, nextState, replace, KEYWORD_LISTS_SETTINGS)}
      />
    </Route>
  </div>
);

import React from 'react';
import Route from 'react-router/lib/Route';

import {
  AUDIENCE_SEGMENTS_SETTINGS,

  isQueryValid,
  buildDefaultQuery
} from '../../containers/Audience/RouteQuerySelector';

import { Audience, Segments } from '../../containers/Audience';

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
    <Route path="audience" component={Audience} >
      <Route
        path="segments"
        component={Segments}
        onEnter={(nextState, replace) => handleOnEnter(nextState, replace, AUDIENCE_SEGMENTS_SETTINGS)}
        onChange={(prevState, nextState, replace) => handleOnChange(prevState, nextState, replace, AUDIENCE_SEGMENTS_SETTINGS)}
      />
    </Route>
  </div>
);

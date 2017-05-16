import React from 'react';
import Route from 'react-router/lib/Route';

import {
  AUTOMATIONS_LIST_SETTINGS,

  isQueryValid,
  buildDefaultQuery
} from '../../containers/Automations/RouteQuerySelector';

import { Automations, List } from '../../containers/Automations';

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
    <Route path="automations" component={Automations} >
      <Route
        path="list"
        component={List}
        onEnter={(nextState, replace) => handleOnEnter(nextState, replace, AUTOMATIONS_LIST_SETTINGS)}
        onChange={(prevState, nextState, replace) => handleOnChange(prevState, nextState, replace, AUTOMATIONS_LIST_SETTINGS)}
      />
    </Route>
  </div>
);

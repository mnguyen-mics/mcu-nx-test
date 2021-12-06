/* eslint-disable */
import React from 'react';
import { render } from 'react-dom';
import { KeycloakService } from '@mediarithmics-private/advanced-components';

import App from './App';

declare global {
  interface Window {
    require: any;
    mainRev: any;
  }
}

const renderApp = () => {
  render(<App />, document.getElementById('mcs-react-app'));
};

KeycloakService.isKeycloakEnabled() ? KeycloakService.initKeycloak(renderApp) : renderApp();

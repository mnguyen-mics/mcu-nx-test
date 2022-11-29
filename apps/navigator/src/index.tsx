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

(window as any)?.MCS_CONSTANTS?.ADMIN_API_TOKEN
  ? renderApp()
  : KeycloakService.initKeycloak(renderApp);

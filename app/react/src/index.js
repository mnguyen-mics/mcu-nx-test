/* eslint-disable */
import React from 'react';
import { render } from 'react-dom';

import App from './App';

render(
  <App />,
  document.getElementById('mcs-react-app'),
  () => {
    window.require([window.mainRev], function() {});
  }
);

/* eslint-disable */
import React from 'react';
import { render } from 'react-dom';

import App from './App';

declare global {
  interface Window {
    require: any;
    mainRev: any;
  }
}

render(<App />, document.getElementById('mcs-react-app'));

/* eslint-disable */
require('babel-polyfill');
require('react-hot-loader/patch');
import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import App from './App';

// if (process.env.NODE_ENV !== 'production') {
//   const {whyDidYouUpdate} = require('why-did-you-update')
//   let createClass = React.createClass;
//   Object.defineProperty(React, 'createClass', {
//     set: (nextCreateClass) => {
//       createClass = nextCreateClass;
//     }
//   });
//   whyDidYouUpdate(React)
// }

render(
  <AppContainer>
      <App />
  </AppContainer>,
  document.getElementById('mcs-react-app')
);

if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;
    render(
      <AppContainer>
          <NextApp />
      </AppContainer>,
      document.getElementById('mcs-react-app')
    );
  });
}

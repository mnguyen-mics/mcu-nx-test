import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import configureStore from './store';
import { Navigator } from './containers/Navigator';

const store = configureStore();

const micsProvider = (
  <Provider store={store}>
    <Navigator />
  </Provider>
);

render(
  micsProvider,
  document.getElementById('mcs-react-app') // eslint-disable-line no-undef
);

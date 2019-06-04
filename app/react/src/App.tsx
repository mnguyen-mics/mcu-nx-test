import 'reflect-metadata';
import * as React from 'react';
import { Provider } from 'react-redux';
import configureStore from './store';
import PersistedStoreService from './services/PersistedStoreService';

import IntlApp from './IntlApp';

const persistedStoreService = new PersistedStoreService();

const preloadedState = localStorage.getItem('store');
const statte = preloadedState ? JSON.parse(preloadedState) : undefined;
const store = configureStore(statte);

store.subscribe(() => {
  persistedStoreService.setStringItem(
    'store',
    JSON.stringify(store.getState()),
  );
});

class App extends React.Component<any, any> {
  render() {
    return (
      <Provider store={store}>
        <IntlApp />
      </Provider>
    );
  }
}

export default App;

import 'reflect-metadata';
import * as React from 'react';
import { Provider } from 'react-redux';
import configureStore from './store';
import PersistedStoreService from './services/PersistedStoreService';
import safeJsonStringify from 'json-stringify-safe';
import IntlApp from './IntlApp';

const persistedStoreService = new PersistedStoreService();

const preloadedState = localStorage.getItem('store');

const state = preloadedState ? JSON.parse(preloadedState) : undefined;

// reseting part of the state that are causing errors (we reset the initial state as well as the drawers that cannot be poped back)
if (state && state.app) {
  state.app.initialized = false;
  state.app.initializationError = false;
}

if (state && state.drawableContents) {
  state.drawableContents = []
}

const store = configureStore(state);

store.subscribe(() => {
  persistedStoreService.setStringItem(
    'store',
    safeJsonStringify(store.getState()), // Use safe json stringify to avoid circular json issue
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

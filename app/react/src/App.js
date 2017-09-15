import React, { Component } from 'react';
import { Provider } from 'react-redux';
import configureStore from './store';

import Navigator from './containers/Navigator';

const store = configureStore();
type AppProps = {};
type AppState = {};
class App extends Component<AppProps, AppState> {
  render() {
    return (<Provider store={store}>
      <Navigator />
    </Provider>);
  }
}

export default App;

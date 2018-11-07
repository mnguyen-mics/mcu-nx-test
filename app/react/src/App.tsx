import 'reflect-metadata';
import * as React from 'react';
import { Provider } from 'react-redux';
import configureStore from './store';

import IntlApp from './IntlApp';

const store = configureStore();

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

import 'reflect-metadata';
import * as React from 'react';
import { Provider } from 'react-redux';
import configureStore from './store';
import IntlApp from './IntlApp';
import { IocProvider } from './config/inversify.react';
import { container } from './config/inversify.config';

const store = configureStore();

interface Props {}

class App extends React.Component<Props> {
  render() {
    return (
      <Provider store={store}>
        <IocProvider container={container}>
          <IntlApp />
        </IocProvider>
      </Provider>
    );
  }
}

export default App;

import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import 'babel-polyfill';
import createSagaMiddleware from 'redux-saga';

import { apiRequest, logoutListener } from '../middleware';
import rootReducer from '../reducers';
import sagas from '../state/sagas';

// Uncomment to ajust plugged middlewares accordingly
// const IS_PROD = process.env.NODE_ENV !== 'production';

export default function configureStore() {

  const middlewares = [];

  const sagaMiddleware = createSagaMiddleware();

  middlewares.push(logoutListener);
  middlewares.push(thunkMiddleware);
  middlewares.push(apiRequest);
  middlewares.push(sagaMiddleware);

  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // eslint-disable-line no-undef, no-underscore-dangle

  const store = createStore(rootReducer, /* preloadedState, */ composeEnhancers(
    applyMiddleware(...middlewares)
  ));

  sagaMiddleware.run(sagas);

  return store;
}

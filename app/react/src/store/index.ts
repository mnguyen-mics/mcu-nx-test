// https://github.com/redux-saga/redux-saga#using-umd-build-in-the-browser
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';
import { apiRequest, logoutListener } from '../middleware';
import rootReducer from '../reducers';
import sagas from '../state/sagas';
import container from '../config/inversify.config';
import { TYPES } from '../constants/types';
import { INavigatorService } from '../services/NavigatorService';

// Uncomment to ajust plugged middlewares accordingly
// const IS_PROD = process.env.NODE_ENV !== 'production';

function bindDependencies(
  func: (state: any, navigatorService: INavigatorService) => void,
  dependencies: symbol[],
) {
  const injections = dependencies.map(dependency => {
    return container.container.get(dependency);
  });
  return func.bind(func, ...injections);
}

export { bindDependencies };

function configureStore(
  navigatorService: INavigatorService,
  preloadedState: any,
) {
  const middlewares = [];

  const sagaMiddleware = createSagaMiddleware({
    context: {
      navigatorService: navigatorService,
    },
  });

  middlewares.push(logoutListener);
  middlewares.push(thunkMiddleware);
  middlewares.push(apiRequest);
  middlewares.push(sagaMiddleware);

  const composeEnhancers =
    (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // eslint-disable-line no-undef, no-underscore-dangle

  const store = preloadedState
    ? createStore(
        rootReducer,
        preloadedState,
        composeEnhancers(applyMiddleware(...middlewares)),
      )
    : createStore(
        rootReducer,
        composeEnhancers(applyMiddleware(...middlewares)),
      );

  sagaMiddleware.run(sagas);

  return store;
}

export default bindDependencies(configureStore, [TYPES.INavigatorService]);

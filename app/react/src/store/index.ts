import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';
import { apiRequest, logoutListener } from '../middleware';
import rootReducer from '../reducers';
import container from '../config/inversify.config';
import { TYPES } from '../constants/types';
import { INavigatorService } from '../services/NavigatorService';
import { ILabelService } from '../services/LabelsService';
import { IOrganisationService } from '../services/OrganisationService';
import {
  IAuthService,
  ITagService,
  MicsReduxState,
} from '@mediarithmics-private/advanced-components';
import sagas from '../redux/sagas';

function bindDependencies(
  func: (
    navigatorService: INavigatorService,
    authService: IAuthService,
    labelService: ILabelService,
    organisationService: IOrganisationService,
    tagService: ITagService,
    state: MicsReduxState,
  ) => void,
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
  authService: IAuthService,
  labelService: ILabelService,
  organisationService: IOrganisationService,
  tagService: ITagService,
  preloadedState: MicsReduxState,
) {
  const middlewares = [];

  const sagaMiddleware = createSagaMiddleware({
    context: {
      navigatorService: navigatorService,
      authService: authService,
      labelService: labelService,
      organisationService: organisationService,
      tagService: tagService,
    },
  });

  middlewares.push(logoutListener);
  middlewares.push(thunkMiddleware);
  middlewares.push(apiRequest);
  middlewares.push(sagaMiddleware);

  const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // eslint-disable-line no-undef, no-underscore-dangle

  const store = preloadedState
    ? createStore(rootReducer, preloadedState, composeEnhancers(applyMiddleware(...middlewares)))
    : createStore(rootReducer, composeEnhancers(applyMiddleware(...middlewares)));

  sagaMiddleware.run(sagas);

  return store;
}

export default bindDependencies(configureStore, [
  TYPES.INavigatorService,
  TYPES.IAuthService,
  TYPES.ILabelService,
  TYPES.IOrganisationService,
  TYPES.ITagService,
]);

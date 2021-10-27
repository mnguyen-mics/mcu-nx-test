import { MicsReduxState } from '@mediarithmics-private/advanced-components';

const isAppInitialized = (state: MicsReduxState) => {
  return state.app.initialized;
};

export { isAppInitialized };

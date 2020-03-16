import { MicsReduxState } from '../../utils/ReduxHelper';

const isAppInitialized = (state: MicsReduxState) => {
  return state.app.initialized;
};

export { isAppInitialized };

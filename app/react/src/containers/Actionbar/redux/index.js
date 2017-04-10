import {
  actionbarState,
  setSecondaryActionBar,
  pushBreadcrumb,
  popBreadcrumb,
  setBreadcrumb
} from './Actionbar';

const ActionbarReducers = {
  actionbarState
};

const ActionbarActions = {
  setSecondaryActionBar,
  pushBreadcrumb,
  popBreadcrumb,
  setBreadcrumb
};

export { ActionbarReducers, ActionbarActions };

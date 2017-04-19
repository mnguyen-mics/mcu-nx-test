import {
  ACTION_BAR_BREADCRUMB_POP,
  ACTION_BAR_BREADCRUMB_PUSH,
  ACTION_BAR_BREADCRUMB_SET,
  ACTION_BAR_SET_SECONDARY
} from '../action-types';

const setSecondaryActionBar = visible => dispatch =>
    dispatch({
      type: ACTION_BAR_SET_SECONDARY,
      secondaryBar: visible
    });

const pushBreadcrumb = breadcrumbValue => dispatch =>
  dispatch({
    type: ACTION_BAR_BREADCRUMB_PUSH,
    breadcrumb: { breadcrumbName: breadcrumbValue }
  });

const popBreadcrumb = () => dispatch =>
  dispatch({
    type: ACTION_BAR_BREADCRUMB_POP
  });

const setBreadcrumb = (from, path) => dispatch =>
  dispatch({
    type: ACTION_BAR_BREADCRUMB_SET,
    from,
    path
  });

export {
  setSecondaryActionBar,
  pushBreadcrumb,
  popBreadcrumb,
  setBreadcrumb
};

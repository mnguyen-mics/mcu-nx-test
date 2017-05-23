import {
  ACTION_BAR_BREADCRUMB_POP,
  ACTION_BAR_BREADCRUMB_PUSH,
  ACTION_BAR_BREADCRUMB_SET
} from '../action-types';

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
  pushBreadcrumb,
  popBreadcrumb,
  setBreadcrumb
};


const ACTION_BAR = {
  BREADCRUMB: {
    PUSH: 'ACTION_BAR_BREADCRUMB_PUSH',
    POP: 'ACTION_BAR_BREADCRUMB_POP',
    SET: 'ACTION_BAR_BREADCRUMB_SET',
  },
  SET_SECONDARY: 'ACTION_BAR_SET_SECONDARY'
};

const setSecondaryActionBar = visible => dispatch =>
    dispatch({
      type: ACTION_BAR.SET_SECONDARY,
      secondaryBar: visible
    });

const pushBreadcrumb = breadcrumbValue => dispatch =>
  dispatch({
    type: ACTION_BAR.BREADCRUMB.PUSH,
    breadcrumb: { breadcrumbName: breadcrumbValue }
  });

const popBreadcrumb = () => dispatch =>
  dispatch({
    type: ACTION_BAR.BREADCRUMB.POP
  });

const setBreadcrumb = (from, path) => dispatch =>
  dispatch({
    type: ACTION_BAR.BREADCRUMB.SET,
    from,
    path
  });


const defaultActionbarState = {
  path: [],
  secondary: null
};


const actionbarState = (state = defaultActionbarState, action) => {
  switch (action.type) {
    case ACTION_BAR.BREADCRUMB.PUSH: {
      const newPath = [...state.path];
      newPath.push(action.breadcrumb);
      return {
        ...state,
        path: newPath
      };
    }

    case ACTION_BAR.BREADCRUMB.POP: {
      const newPath = [...state.path];
      newPath.pop();
      return {
        ...state,
        path: newPath
      };
    }

    case ACTION_BAR.BREADCRUMB.SET: {

      const newPath = action.from === 0 ?
        action.path : state.path.slice(0, action.from).concat(action.path);

      return {
        ...state,
        path: newPath
      };
    }

    case ACTION_BAR.SET_SECONDARY: {
      return {
        ...state,
        secondary: action.secondaryBar
      };
    }

    default:
      return state;
  }
};

export {

  actionbarState,

  setSecondaryActionBar,

  pushBreadcrumb,
  popBreadcrumb,
  setBreadcrumb
};

import {
  ACTION_BAR_BREADCRUMB_POP,
  ACTION_BAR_BREADCRUMB_PUSH,
  ACTION_BAR_BREADCRUMB_SET,
  ACTION_BAR_SET_SECONDARY
} from '../action-types';

const defaultActionbarState = {
  path: [],
  secondary: null
};


const actionbarState = (state = defaultActionbarState, action) => {
  switch (action.type) {
    case ACTION_BAR_BREADCRUMB_PUSH: {
      const newPath = [...state.path];
      newPath.push(action.breadcrumb);
      return {
        ...state,
        path: newPath
      };
    }

    case ACTION_BAR_BREADCRUMB_POP: {
      const newPath = [...state.path];
      newPath.pop();
      return {
        ...state,
        path: newPath
      };
    }

    case ACTION_BAR_BREADCRUMB_SET: {

      const newPath = action.from === 0 ?
        action.path : state.path.slice(0, action.from).concat(action.path);

      return {
        ...state,
        path: newPath
      };
    }

    case ACTION_BAR_SET_SECONDARY: {
      return {
        ...state,
        secondary: action.secondaryBar
      };
    }

    default:
      return state;
  }
};

const ActionbarReducers = {
  actionbarState
};

export default ActionbarReducers;

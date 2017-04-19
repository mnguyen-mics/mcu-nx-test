import { SIDEBAR_SWITCH_VISIBILITY } from '../action-types';

const defaultSidebarState = {
  isVisible: true
};

const sidebarState = (state = defaultSidebarState, action) => {

  switch (action.type) {

    case SIDEBAR_SWITCH_VISIBILITY:
      return {
        ...state,
        isVisible: action.isVisible ? action.isVisible : !state.isVisible
      };

    default:
      return state;
  }

};

const SidebarStateReducers = {
  sidebarState
};

export default SidebarStateReducers;

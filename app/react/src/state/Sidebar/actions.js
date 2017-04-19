import { SIDEBAR_SWITCH_VISIBILITY } from '../action-types';

const switchSidebarVisibility = isVisible => {
  return (dispatch) => {
    return dispatch({
      type: SIDEBAR_SWITCH_VISIBILITY,
      isVisible
    });
  };
};


export {
  switchSidebarVisibility
};

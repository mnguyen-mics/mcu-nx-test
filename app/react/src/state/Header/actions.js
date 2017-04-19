import { HEADER_SWITCH_VISIBILITY } from '../action-types';

const switchVisibility = isVisible => {
  return (dispatch) => {
    return dispatch({
      type: HEADER_SWITCH_VISIBILITY,
      isVisible
    });
  };
};

export {
  switchVisibility
};

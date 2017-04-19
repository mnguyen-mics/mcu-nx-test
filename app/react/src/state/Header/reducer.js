import { HEADER_SWITCH_VISIBILITY } from '../action-types';

const defaultHeaderState = {
  isVisible: true
};

const headerState = (state = defaultHeaderState, action) => {

  switch (action.type) {

    case HEADER_SWITCH_VISIBILITY:
      return {
        ...state,
        isVisible: action.isVisible ? action.isVisible : !state.isVisible
      };

    default:
      return state;
  }

};

const HeaderStateReducers = {
  headerState
};

export default HeaderStateReducers;

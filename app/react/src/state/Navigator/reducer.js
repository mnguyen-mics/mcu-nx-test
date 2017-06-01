import {
  NAVIGATOR_GET_VERSION
} from '../action-types';

const defaultNavigatorState = {
  version: null
};

const navigator = (state = defaultNavigatorState, action) => {

  switch (action.type) {
    case NAVIGATOR_GET_VERSION.SUCCESS:
      return {
        ...state,
        ...action.payload
      };

    case NAVIGATOR_GET_VERSION.REQUEST:
    case NAVIGATOR_GET_VERSION.FAILURE:
    default:
      return state;
  }

};

const NavigatorReducers = {
  navigator
};

export default NavigatorReducers;


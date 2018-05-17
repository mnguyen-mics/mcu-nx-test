import {
  STORE_ORG_FEATURES,
} from '../action-types';

const features = (state = {
  organisation: [],
}, action) => {
  switch (action.type) {
    case STORE_ORG_FEATURES:
      return {
        ...state,
        organisation: action.payload,
      };
    default:
      return state;
  }
};

const FeaturesReducer = {
  features,
};

export default FeaturesReducer;


import { STORE_ORG_FEATURES, STORE_FEATURE_FLAG_CLIENT } from '../action-types';
import { Action } from 'redux-actions';
import { Payload } from '../../utils/ReduxHelper';

const features = (
  state = {
    organisation: [],
  },
  action: Action<Payload>,
) => {
  switch (action.type) {
    case STORE_ORG_FEATURES:
      return {
        ...state,
        organisation: action.payload,
      };
    case STORE_FEATURE_FLAG_CLIENT:
      return {
        ...state,
        client: action.payload,
      };
    default:
      return state;
  }
};

const FeaturesReducer = {
  features,
};

export default FeaturesReducer;

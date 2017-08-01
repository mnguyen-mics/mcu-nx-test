const REQUEST = 'REQUEST';
const SUCCESS = 'SUCCESS';
const FAILURE = 'FAILURE';

export const createRequestTypes = base => {
  return [REQUEST, SUCCESS, FAILURE].reduce((acc, type) => ({
    ...acc,
    [type]: `${base}_${type}`,
  }), {});
};

const defaultMetadata = {
  isFetching: false,
  error: false,
  total: 0,
};

export const createRequestMetadataReducer = requestTypes => (state = defaultMetadata, action) => {
  switch (action.type) {
    case requestTypes.REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case requestTypes.SUCCESS:
      return {
        ...state,
        isFetching: false,
        total: action.payload.total,
      };
    case requestTypes.FAILURE:
      return {
        ...state,
        isFetching: false,
        error: action.payload,
      };
    default: return state;
  }
};

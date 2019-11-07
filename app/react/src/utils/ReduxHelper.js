const REQUEST = 'REQUEST';
const SUCCESS = 'SUCCESS';
const FAILURE = 'FAILURE';
const EXPIRED_PASSWORD = 'EXPIRED_PASSWORD';

export const createRequestTypes = base => {
  return [REQUEST, SUCCESS, FAILURE, EXPIRED_PASSWORD].reduce(
    (acc, type) => ({
      ...acc,
      [type]: `${base}_${type}`,
    }),
    {},
  );
};

const defaultMetadata = {
  isFetching: false,
  error: false,
  total: 0,
};

export const createRequestMetadataReducer = requestTypes => (
  state = defaultMetadata,
  action,
) => {
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
    case requestTypes.EXPIRED_PASSWORD:
      return {
        ...state,
        isFetching: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

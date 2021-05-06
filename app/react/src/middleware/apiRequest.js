import ApiService from '../services/ApiService.ts';

export const CALL_API = Symbol('Call Api');

export default store => next => action => {
  const callAPI = action[CALL_API];

  if (typeof callAPI === 'undefined') {
    return next(action);
  }

  const {
    method,
    endpoint,
    params,
    headers,
    body,
    types,
    authenticated,
    adminApi,
    localUrl,
    others = {},
  } = callAPI;
  const [requestType, failureType, successType] = types;
  const { dispatch } = store;
  const options = {
    adminApi,
    localUrl,
  };

  const onRequest = type => {
    return {
      type,
      others,
    };
  };

  const onRequestSuccess = (type, payload) => {
    return {
      type,
      response: payload,
      authenticated: true,
      body,
      others,
    };
  };

  const onRequestFailure = (type, error) => {
    return {
      type,
      others,
      response: error,
    };
  };

  dispatch(onRequest(requestType));

  return ApiService.request(method, endpoint, params, headers, body, authenticated, options)
    .then(json => dispatch(onRequestSuccess(successType, json)))
    .catch(error => {
      dispatch(onRequestFailure(failureType, error));
      return Promise.reject(error);
    });
};

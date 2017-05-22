// Inspired from redux-actions https://github.com/acdlite/redux-actions/blob/master/src/createAction.js

import { identity, isFunction, isNull } from 'lodash';
// import isFunction from 'lodash/isFunction';
// import isNull from 'lodash/isNull';

/**
 * Function to create FSA compliant redux action
 * @param {*} typeString type of the action, preferably a constant
 * @param {*} payloadCreator must be a function, undefined, or null. If payloadCreator is undefined or null, the identity function is used.
 * @param {*} metaCreator optional function that creates metadata for the payload
 */
export const createAction = (typeString, payloadCreator = identity, metaCreator) => {

  if (!isFunction(payloadCreator) && !isNull(payloadCreator)) {
    throw new Error('Expected payloadCreator to be a function, undefined or null');
  }

  const finalPayloadCreator = isNull(payloadCreator) || payloadCreator === identity
    ? identity
    : (head, ...args) => (head instanceof Error
     ? head : payloadCreator(head, ...args));

  const hasMeta = isFunction(metaCreator);

  const actionCreator = (...args) => {
    const payload = finalPayloadCreator(...args);
    const action = { type: typeString };

    if (payload instanceof Error) {
      action.error = true;
    }

    if (payload !== undefined) {
      action.payload = payload;
    }

    if (hasMeta) {
      action.meta = metaCreator(...args);
    }

    return action;
  };

  actionCreator.toString = () => typeString;

  return actionCreator;
};

const REQUEST = 'REQUEST';
const SUCCESS = 'SUCCESS';
const FAILURE = 'FAILURE';

export const createRequestTypes = base => {
  return [REQUEST, SUCCESS, FAILURE].reduce((acc, type) => ({
    ...acc,
    [type]: `${base}_${type}`
  }), {});
};


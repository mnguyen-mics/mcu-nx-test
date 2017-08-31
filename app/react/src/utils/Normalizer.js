/**
 * Normalize an array of object like the following :
 *
 * In this example, key = 'id'
 * [{id:"1", other: "some value"},{id:"2", other: "some value"}]
 *
 * TO
 *
 * {
 *  1: {id:"1", other: "some value"}
 *  2: {id:"2", other: "some value"}
 * }
 * @param {*} arr input array of object to convert
 * @param {*} key object key to extract
 */
export const normalizeArrayOfObject = (arr, key) => {
  if (!Array.isArray(arr)) throw new Error(`${arr} is not an array`);
  return arr.reduce((acc, object) => {
    const keyValue = object[key];
    if (!keyValue) return acc;
    return {
      ...acc,
      [keyValue]: object,
    };
  }, {});
};

/**
 * Normalize an array of object like the following :
 *
 * In this example, key = 'id'
 * [{id:1, type:"USER_ACCOUNT", other: "some value"},{id:2, type:"USER_ACCOUNT", other: "some value"}, {id:3 type:"USER_EMAIL", other: "some value"}]
 *
 * TO
 *
 * {
 *  USER_ACCOUNT: [{id:"1", other: "some value"}, {id:"2", other: "some value"}]
 *  USER_EMAIL: [{id:"3", other: "some value"}]
 * }
 * @param {*} arr input array of object to convert
 * @param {*} key object key to extract
 */
export const normalizeArrayOfObjectToObjectOfArray = (arr, key) => {
  if (!Array.isArray(arr)) throw new Error(`${arr} is not an array`);
  return arr.reduce((acc, object) => {
    const keyValue = object[key];
    if (!keyValue) return acc;
    const nextAcc = {
      ...acc,
    };
    const newValue = [];
    if (Array.isArray(nextAcc[keyValue])) {
      nextAcc[keyValue].forEach((element) => {
        newValue.push(element);
      });
      newValue.push(object);
    } else {
      newValue.push(object);
    }
    nextAcc[keyValue] = newValue;
    return {
      ...nextAcc,
    };
  }, {});
};

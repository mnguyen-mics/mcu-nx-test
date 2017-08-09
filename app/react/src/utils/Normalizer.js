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

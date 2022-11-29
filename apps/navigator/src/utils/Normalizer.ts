/**
 * Normalize an array of object like the following :
 *
 * In this example, key = 'id'
 * [{id:"x", other: "some value"},{id:"y", other: "some value"}]
 *
 * TO
 *
 * {
 *  x: {id:"x", other: "some value"}
 *  x: {id:"y", other: "some value"}
 * }
 * @param {*} arr input array of object to convert
 * @param {*} key object key to extract
 */
import { Index } from './index';
import { ItemsById } from '../containers/Campaigns/Display/Dashboard/ProgrammaticCampaign/domain';

export function normalizeArrayOfObject<T, K extends keyof T>(arr: T[], key: K): Index<T> {
  if (!Array.isArray(arr)) throw new Error(`${arr} is not an array`);
  return arr.reduce((acc, object) => {
    const val: {} = object[key];
    if (val) {
      const keyValue = val.toString();
      return {
        ...acc,
        [keyValue]: object,
      };
    } else {
      return '';
    }
  }, {});
}

export function formateList<T>(a: { [key: string]: T }) {
  return Object.keys(a).map(k => {
    return a[k];
  });
}

export function formatListView(a: ItemsById<any>, b: ItemsById<any>) {
  return Object.keys(a.items).map(c => {
    return {
      ...a.items[c],
      ...b.items[c],
    };
  });
}

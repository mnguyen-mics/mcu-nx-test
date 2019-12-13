import { injectable } from 'inversify';

const LOCAL_STORAGE_TEST = 'localStorageSupported';

export interface IPersistedStoreService {
  isLocalStorageSupported: () => boolean;

  setStringItem: (property: string, item: string) => void | undefined;

  getStringItem: (property: string) => string | undefined | null;

  removeStringItem: (property: string) => void | undefined;
}
@injectable()
export default class PersistedStoreService implements IPersistedStoreService {
  isLocalStorageSupported() {
    try {
      localStorage.setItem(LOCAL_STORAGE_TEST, 'true');
      localStorage.removeItem(LOCAL_STORAGE_TEST);
      return true;
    } catch (e) {
      return false;
    }
  }

  setStringItem(property: string, item: string) {
    return this.isLocalStorageSupported()
      ? window.localStorage.setItem(property, item)
      : undefined;
  }

  getStringItem(property: string) {
    return this.isLocalStorageSupported()
      ? window.localStorage.getItem(property)
      : undefined;
  }

  removeStringItem(property: string) {
    return this.isLocalStorageSupported()
      ? window.localStorage.removeItem(property)
      : undefined;
  }
}

/* eslint-disable no-before-define */
/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

import Cookies from 'js-cookie';

const LANGUAGE_KEY = 'language';
const LOCAL_STORAGE_TEST = 'localStorageSupported';

function isLocalStorageSupported() {

  try {
    localStorage.setItem(LOCAL_STORAGE_TEST, "true");
    localStorage.removeItem(LOCAL_STORAGE_TEST);
    return true;
  } catch (e) {
    return false;
  }
}

function getItemLocalStorage(property: string) {
  // use both until we have the angular app
  return localStorage.getItem(property) || getItemCookie(property);
}

function getItemCookie(property: string) {
  return Cookies.get(property);
}

function setItemLocalStorage(property: {[key: string]: string}) {

  Object.keys(property).forEach(key => {
    localStorage.setItem(key, property[key]);
  });

}

function setItemCookie(property: {[key: string]: string}) {

  Object.keys(property).forEach(key => {
    Cookies.set(key, property[key]);
  });

}

function removeItemLocalStorage(property: string) {
  // use both until we have the angular app
  removeItemCookie(property);
  return localStorage.removeItem(property);
}

function removeItemCookie(property: string) {
  return Cookies.remove(property);
}


const getItem = (property: string) => {
  return isLocalStorageSupported() ? getItemLocalStorage(property) : getItemCookie(property);
};

const setItem = (property: {[key: string]: string}) => {
  return isLocalStorageSupported() ? setItemLocalStorage(property) : setItemCookie(property);
};

const removeItem = (property: string) => {
  return isLocalStorageSupported() ? removeItemLocalStorage(property) : removeItemCookie(property);
};

export default {
  LANGUAGE_KEY,
  getItem,
  setItem,
  removeItem,
};

import { deburr, lowerCase } from 'lodash';

function toPascalCase(string) {
  return string.match(/[a-z]+/gi)
    .map(word => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase())
    .join('');
}

function toLowerCaseNoAccent(string = '') {
  return lowerCase(deburr(string));
}

export {
  toLowerCaseNoAccent,
  toPascalCase
};

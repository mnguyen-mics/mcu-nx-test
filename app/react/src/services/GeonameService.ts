import ApiService from './ApiService';

// interface Geoname {
// }

// const getGeonames: Promise<T> = () => {

const getGeonames = () => {
  const endpoint = 'geonames';

  return ApiService.getRequest(endpoint);
};

export default {
  getGeonames,
};

// import ApiService from './ApiService';

export interface Geoname {
  id: string;
  name: string;
}

const GeonameService = {
  getGeonames(): Promise<Geoname[]> {
    // const endpoint = 'geonames/';
    // return ApiService.getRequest(endpoint).then(res => res.data as Geoname[]);
    return Promise.resolve([
      {
        id: '1',
        name: 'Fake Geoname #1',
        exclude: false,
        country_iso: 'FG1',
        admin1: '00',
        admin2: null,
        admin3: null,
        admin4: null,
        postal_code: null,
      },
      {
        id: '2564',
        name: 'Fake Geoname #2',
        exclude: false,
        country_iso: 'FG2',
        admin1: '55',
        admin2: null,
        admin3: null,
        admin4: null,
        postal_code: null,
      }]);
  },
};

export default GeonameService;

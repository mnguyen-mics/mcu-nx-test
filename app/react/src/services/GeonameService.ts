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
        name: 'La France du Général de Gaulle',
        exclude: false,
        country_iso: 'FRGDG',
        admin1: '00',
        admin2: null,
        admin3: null,
        admin4: null,
        postal_code: null,
      },
      {
        id: '2564',
        name: 'Pays quelconque',
        exclude: false,
        country_iso: 'PQ',
        admin1: '55',
        admin2: null,
        admin3: null,
        admin4: null,
        postal_code: null,
      }]);
  },
};

export default GeonameService;

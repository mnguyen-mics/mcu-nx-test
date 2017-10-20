import ApiService from './ApiService';

export interface Geoname {
  id: string;
  name: string;
}

const GeonameService = {
  getGeonames(): Promise<Geoname[]> {
    const endpoint = 'geonames/';
    return ApiService.getRequest(endpoint).then(res => res.data as Geoname[]);
  },
};

export default GeonameService;

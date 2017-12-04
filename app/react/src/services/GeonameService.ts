import ApiService, { DataResponse } from './ApiService';

export interface Geoname {
  id: string;
  name: string;
  country_iso: string;
  admin1: string;
  admin2: string;
}

export type Language = 'fr' | 'en';

const GeonameService = {
  getGeonames(
    keywords: string,
    lang: Language = 'fr',
    country: string = 'FR',
  ): Promise<Geoname[]> {
    const endpoint = 'geonames';
    const params = {
      keywords,
      lang,
      country,
    };
    return ApiService.getRequest(endpoint, params).then((res: DataResponse<Geoname[]>) => res.data as Geoname[]);
  },

  getGeoname(
    geonameId: string,
  ): Promise<Geoname> {
    const endpoint = `geonames/${geonameId}`;
    return ApiService.getRequest(endpoint).then((res: DataResponse<Geoname>) => res.data as Geoname);
  },
};

export default GeonameService;

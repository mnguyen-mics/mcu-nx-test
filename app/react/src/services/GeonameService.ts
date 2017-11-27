import { Language } from './GeonameService.js';
import ApiService from './ApiService.js';

export interface Geoname {
  id: string;
  name: string;
}

export type Language = 'fr' | 'en';

const GeonameService = {
  getGeonames(
    keywords: string,
    lang: Language = 'fr',
    country: string = 'FR',
  ): Promise<Geoname[]> {
    const endpoint = 'geonames/';
    const params = {
      keywords,
      lang,
      country,
    };
    return ApiService.getRequest(endpoint, params).then((res) => res.data as Geoname[]);
  },
};

export default GeonameService;

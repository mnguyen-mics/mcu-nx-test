import { Language } from './GeonameService';
import ApiService from './ApiService';

export interface Geoname {
  id: string;
  name: string;
}

export type Language = 'fr-FR' | 'en-US';

const GeonameService = {
  getGeonames(
    keywords: string,
    lang: Language = 'fr-FR',
    country: string = 'France',
  ): Promise<Geoname[]> {
    const endpoint = 'geonames/';
    const params = {
      keywords,
      lang,
      country,
    };
    // return ApiService.getRequest(endpoint, params).then(res => res.data as Geoname[]);
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
      },
      {
        id: '15785',
        name: 'Fake Geoname #3',
        exclude: false,
        country_iso: 'FG3',
        admin1: '00',
        admin2: null,
        admin3: null,
        admin4: null,
        postal_code: null,
      },
      {
        id: '228282',
        name: 'Fake Geoname #4',
        exclude: false,
        country_iso: 'FG4',
        admin1: '55',
        admin2: null,
        admin3: null,
        admin4: null,
        postal_code: null,
      },
      {
        id: '90229',
        name: 'Fake Geoname #5',
        exclude: false,
        country_iso: 'FG5',
        admin1: '55',
        admin2: null,
        admin3: null,
        admin4: null,
        postal_code: null,
      },
      {
        id: '485',
        name: 'Fake Geoname #6',
        exclude: false,
        country_iso: 'FG3',
        admin1: '00',
        admin2: null,
        admin3: null,
        admin4: null,
        postal_code: null,
      },
      {
        id: '7604',
        name: 'Fake Geoname #7',
        exclude: false,
        country_iso: 'FG4',
        admin1: '55',
        admin2: null,
        admin3: null,
        admin4: null,
        postal_code: null,
      },
      {
        id: '93229',
        name: 'Fake Geoname #8',
        exclude: false,
        country_iso: 'FG5',
        admin1: '55',
        admin2: null,
        admin3: null,
        admin4: null,
        postal_code: null,
      },
    ]);
  },
};

export default GeonameService;

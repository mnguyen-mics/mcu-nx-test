import ApiService, { DataResponse, DataListResponse } from './ApiService';
import { injectable } from 'inversify';

export interface Geoname {
  id: string;
  name: string;
  country_iso: string;
  admin1: string;
  admin2: string;
}

export type Language = 'fr' | 'en';

export interface IGeonameService {
  getGeonames: (
    keywords: string,
    lang: Language,
    country: string,
  ) => Promise<DataListResponse<Geoname>>;

  getGeoname: (geonameId: string) => Promise<DataResponse<Geoname>>;
}

@injectable()
export class GeonameService implements IGeonameService {
  getGeonames(
    keywords: string,
    lang: Language = 'fr',
    country: string = 'FR',
  ): Promise<DataListResponse<Geoname>> {
    const endpoint = 'geonames';
    const params = {
      keywords,
      lang,
      country,
    };
    return ApiService.getRequest(endpoint, params);
  }

  getGeoname(geonameId: string): Promise<DataResponse<Geoname>> {
    const endpoint = `geonames/${geonameId}`;
    return ApiService.getRequest(endpoint);
  }
}

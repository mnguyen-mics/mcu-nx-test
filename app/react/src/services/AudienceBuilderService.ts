import { AudienceBuilderResource } from './../models/audienceBuilder/AudienceBuilderResource';
import { DataListResponse, StatusCode } from './ApiService';
import { injectable } from 'inversify';

export interface IAudienceBuilderService {
  getAudienceBuilders: (
    organisationId: string,
  ) => Promise<DataListResponse<AudienceBuilderResource>>;
}

@injectable()
export default class AudienceBuilderService implements IAudienceBuilderService {
  getAudienceBuilders(
    organisationId: string,
  ): Promise<DataListResponse<AudienceBuilderResource>> {
    // const endpoint = `audience_builder`;
    // const options = {
    //   organisation_id: organisationId,
    // };
    // return ApiService.getRequest(endpoint, options);
    return Promise.resolve({
      status: 'ok' as StatusCode,
      data: [
        {
          id: '1',
          name: 'Audience Builder 1',
          datamart_id: '1162',
        },
      ],
      count: 3,
    });
  }
}

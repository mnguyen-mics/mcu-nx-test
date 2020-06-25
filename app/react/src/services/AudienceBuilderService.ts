import { AudienceBuilderResource } from './../models/audienceBuilder/AudienceBuilderResource';
import { DataListResponse, StatusCode } from './ApiService';
import { injectable } from 'inversify';

export interface IAudienceBuilderService {
  getAudienceBuilders: (
    organisationId: string,
  ) => Promise<DataListResponse<AudienceBuilderResource>>;
  // getQueryFragments: (
  //   datamartId: string,
  // ) => Promise<DataListResponse<QueryFragmentResource>>;
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
        {
          id: '2',
          name: 'Audience Builder 2',
          datamart_id: '2',
        },
        {
          id: '3',
          name: 'Audience Builder 3',
          datamart_id: '3',
        },
      ],
      count: 3,
    });
  }
  // getQueryFragments(
  //   datamartId: string,
  // ): Promise<DataListResponse<QueryFragmentResource>> {
  //   const queryFragments: QueryFragmentResource[] = [
  //     {
  //       id: '42',
  //       datamart_id: '1162',
  //       demographic_query_fragment: true,
  //       properties: [
  //         {
  //           id: '01',
  //           name: 'gender',
  //           value: undefined,
  //           type: 'radio',
  //           options: ['male', 'female', 'all'],
  //         },
  //         {
  //           id: '02',
  //           name: 'age',
  //           value: undefined,
  //           inputType: 'select',
  //           options: ['18-25', '26-35', '36-45'],
  //         },
  //         {
  //           id: '03',
  //           name: 'language',
  //           value: undefined,
  //           type: 'select_multiple',
  //           options: ['french', 'english', 'spanish'],
  //         },
  //       ],
  //     },
  //     {
  //       id: '421',
  //       datamart_id: '1162',
  //       properties: [
  //         {
  //           id: '04',
  //           name: 'industry',
  //           value: undefined,
  //           options: ['software', 'aeromautic', 'textile'],
  //           type: 'select_multiple',
  //           breadCrumb: ['Demographics', 'Employment', 'Industry'],
  //         },
  //         {
  //           id: '05',
  //           name: 'automotive',
  //           value: undefined,
  //           options: ['renault', 'bmw', 'ford'],
  //           type: 'select_multiple',
  //           breadCrumb: ['Psychographic', 'Interest', 'Automotive'],
  //         },
  //         {
  //           id: '06',
  //           name: 'region',
  //           value: undefined,
  //           options: ['paris', 'bretagne', 'auvergne_rhone_alpes'],
  //           type: 'select_multiple',
  //           breadCrumb: ['Geographical', 'Country', 'Region'],
  //         },
  //       ],
  //     },
  //     {
  //       id: '43',
  //       datamart_id: '2',
  //       demographic_query_fragment: true,
  //       properties: [
  //         {
  //           id: '07',
  //           name: 'name',
  //           value: undefined,
  //           type: 'input',
  //           options: undefined,
  //         },
  //         {
  //           id: '08',
  //           name: 'height',
  //           value: undefined,
  //           type: 'radio',
  //           options: ['small', 'normal', 'tall'],
  //         },
  //         {
  //           id: '09',
  //           name: 'weight',
  //           value: undefined,
  //           type: 'input',
  //           options: undefined,
  //         },
  //       ],
  //     },
  //     {
  //       id: '431',
  //       datamart_id: '2',
  //       properties: [
  //         {
  //           id: '10',
  //           name: 'food',
  //           value: undefined,
  //           options: ['pizza', 'vegetables', 'meat'],
  //           type: 'select_multiple',
  //           breadCrumb: ['Psychographic', 'Interest', 'Food'],
  //         },
  //         {
  //           id: '11',
  //           name: 'politics',
  //           value: undefined,
  //           options: ['left-wing', 'centrist', 'right-wing'],
  //           type: 'select',
  //           breadCrumb: ['Psychographic', 'Interest', 'Politics'],
  //         },
  //         {
  //           id: '12',
  //           name: 'videogames',
  //           value: undefined,
  //           options: ['playsatation', 'nintendo', 'xbox', 'pc'],
  //           type: 'select',
  //           breadCrumb: ['Psychographics', 'Interest', 'Video games'],
  //         },
  //       ],
  //     },
  //   ];
  //   return Promise.resolve({
  //     status: 'ok' as StatusCode,
  //     data: queryFragments.filter(f => f.datamart_id === datamartId),
  //     count: 3,
  //   });
  // }
}

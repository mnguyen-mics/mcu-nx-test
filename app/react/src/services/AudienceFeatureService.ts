import { AudienceFeatureResource } from '../models/audienceFeature';
import { injectable } from 'inversify';
import { DataListResponse, StatusCode, DataResponse } from './ApiService';

export interface IAudienceFeatureService {
  getAudienceFeatures: (
    datamartId: string,
  ) => Promise<DataListResponse<AudienceFeatureResource>>;
  getAudienceFeature: (
    datamartId: string,
    predicateId: string,
  ) => Promise<DataResponse<AudienceFeatureResource>>;
}

const data: AudienceFeatureResource[] = [
  {
    id: '1',
    name: 'Interest',
    description: 'This is a first descripion',
    token: '',
    addressable_object: 'UserPoint',
    object_tree_expression:
      'interests { car_brands = {{ brands }} and video_games = {{ games }} }',
    variables: [
      { name: 'brands', type: 'Enum', path: ['interests', 'car_brands'] },
      { name: 'games', type: 'Enum', path: ['interests', 'video_games'] },
    ],
  },
  // select { interests { car_brands @map(limit:10000) }} from UserPoint
  {
    id: '2',
    name: 'Family Status',
    description: 'Enter parameters of the targeted family',
    token: '',
    addressable_object: 'UserPoint',
    object_tree_expression:
      'profiles { number_of_children == {{ nb }} and number_of_dogs === {{ nb2 }} and is_married === {{ married }} }',
    variables: [
      {
        name: 'nb',
        type: 'String',
        path: ['profiles', 'number_of_children'],
      },
      { name: 'nb2', type: 'String', path: ['profiles', 'number_of_dogs'] },
      { name: 'married', type: 'Boolean', path: ['profiles', 'is_married'] },
    ],
  },
  // select { profiles { number_of_children @map(limit:10000) } } from UserPoint
  // select { profiles { number_of_dogs @map(limit:10000) } } from UserPoint

  {
    id: '5',
    name: 'Consumption',
    description: 'Enter consumption parameters',
    token: '',
    addressable_object: 'UserPoint',
    object_tree_expression:
      'activities { last_purchase_ts < {{ t1 }} and last_purchase_ts > {{ t2 }} or creation_ts > {{ t3 }}}',
    variables: [
      {
        from: 't1',
        to: 't2',
        type: 'Interval',
        path: ['activities', 'last_purchase_ts'],
      },
      {
        name: 't3',
        type: 'Date',
        path: ['activities', 'creation_ts'],
      },
    ],
  },
  // //
  {
    id: '3',
    name: 'Employment',
    description: 'This is a third descripion',
    token: '',
    addressable_object: 'UserPoint',
    object_tree_expression:
      'profiles { income === {{ salary }} and company_name === {{ company }} and company_position === {{ position }} }',
    variables: [
      { name: 'company', type: 'Enum', path: ['profiles', 'income'] },
      { name: 'salary', type: 'Int', path: ['profiles', 'company_name'] },
      {
        name: 'position',
        type: 'Enum',
        path: ['profiles', 'company_position'],
      },
    ],
  },
  {
    id: '4',
    name: 'Super Users',
    description: 'Users who perform at least 3 purchases during the last week',
    token: '',
    addressable_object: 'addressableObject 4',
    object_tree_expression: 'objectTreeExpression 4',
    variables: [],
  },
  {
    id: '48897',
    name: 'Demographic #1',
    description: 'Target your audience thanks to this first section',
    token: '',
    addressable_object: 'addressableObject 4',
    object_tree_expression: 'profiles {  profile_age > age }',
    variables: [
      {
        name: 'age',
        type: 'Int',
        path: ['profiles', 'age'],
      },
    ],
  },
  {
    id: '48896',
    name: 'Demographic #2',
    description: 'Target your audience thanks to this second section',
    token: '',
    addressable_object: 'addressableObject 4',
    object_tree_expression: 'objectTreeExpression 4',
    variables: [
      {
        name: 'gender',
        type: 'Enum',
        path: ['profiles', 'gender'],
      },
      {
        name: 'languages',
        type: 'Enum',
        path: ['profiles', 'languages'],
      },
    ],
  },

  // {
  //   id: '963',
  //   name: 'Email adress',
  //   description: 'The email adress you want to target',
  //   type: 'AUDIENCE_FEATURE',
  //   addressable_object: 'UserPoint',
  //   object_tree_expression: 'emails { email === {{ email }} }',
  //   variables: [
  //     {
  //       name: 'email',
  //       type: 'String',
  //       path: ['emails', 'email'],
  //     },
  //   ],
  // },
  // {
  //   id: '964',
  //   name: 'The Applications you want to target',
  //   description: 'The apps you want to target',
  //   type: 'AUDIENCE_FEATURE',
  //   addressable_object: 'UserPoint',
  //   object_tree_expression: 'activity_events { app_id === {{ app_id }} }',
  //   variables: [
  //     {
  //       name: 'app_id',
  //       type: 'String',
  //       path: ['activity_events', 'app_id'],
  //     },
  //   ],
  // },
];

@injectable()
export class AudienceFeatureService implements IAudienceFeatureService {
  getAudienceFeatures(
    datamartId: string,
  ): Promise<DataListResponse<AudienceFeatureResource>> {
    // const endpoint = `datamarts/${datamartId}/parametric_predicates`;
    // return ApiService.getRequest(endpoint);
    return Promise.resolve({
      status: 'ok' as StatusCode,
      data: data,
      count: 3,
    });
  }

  getAudienceFeature(
    datamartId: string,
    predicateId: string,
  ): Promise<DataResponse<AudienceFeatureResource>> {
    return Promise.resolve({
      status: 'ok' as StatusCode,
      data: data.find(d => d.id === predicateId)!,
    });
  }
}

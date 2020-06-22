import { ParametricPredicateResource } from './../models/parametricPredicate';
import { injectable } from 'inversify';
import { DataListResponse, StatusCode, DataResponse } from './ApiService';

export interface IParametricPredicateService {
  getParametricPredicates: (
    datamartId: string,
  ) => Promise<DataListResponse<ParametricPredicateResource>>;
  getParametricPredicate: (
    datamartId: string,
    predicateId: string,
  ) => Promise<DataResponse<ParametricPredicateResource>>;
}

const data: ParametricPredicateResource[] = [
  {
    id: '1',
    name: 'Gender',
    description: '',
    type: '',
    addressable_object: 'addressableObject 1',
    object_tree_expression: 'objectTreeExpression 1',
    variables: [
      { name: 'male', type: 'string' },
      { name: 'female', type: 'string' },
    ],
  },
  {
    id: '2',
    name: 'Family Status',
    description: '',
    type: '',
    addressable_object: 'addressableObject 2',
    object_tree_expression: 'objectTreeExpression 2',
    variables: [
      { name: 'Number of children', type: 'Int' },
      { name: 'Married', type: 'string' },
    ],
  },
  {
    id: '3',
    name: 'Languages',
    description: '',
    type: '',
    addressable_object: 'addressableObject 3',
    object_tree_expression: 'objectTreeExpression 3',
    variables: [
      { name: 'French', type: 'string' },
      { name: 'English', type: 'string' },
      { name: 'Spanish', type: 'string' },
    ],
  },
];

@injectable()
export class ParametricPredicateService implements IParametricPredicateService {
  getParametricPredicates(
    datamartId: string,
  ): Promise<DataListResponse<ParametricPredicateResource>> {
    // const endpoint = `datamarts/${datamartId}/parametric_predicates`;
    // return ApiService.getRequest(endpoint);
    return Promise.resolve({
      status: 'ok' as StatusCode,
      data: data,
      count: 3,
    });
  }

  getParametricPredicate(
    datamartId: string,
    predicateId: string,
  ): Promise<DataResponse<ParametricPredicateResource>> {
    return Promise.resolve({
      status: 'ok' as StatusCode,
      data: data.find(d => d.id === predicateId)!,
    });
  }
}

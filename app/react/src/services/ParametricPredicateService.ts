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
    name: 'Interest',
    description: 'This is a first descripion',
    type: '',
    addressable_object: 'addressableObject 1',
    object_tree_expression: 'objectTreeExpression 1',
    variables: [
      { name: 'Car brands', type: 'Enum' },
      { name: 'Video Games', type: 'Enum' },
    ],
  },
  {
    id: '2',
    name: 'Family Status',
    description: 'Enter parameters of the targeted family',
    type: '',
    addressable_object: 'addressableObject 2',
    object_tree_expression: 'objectTreeExpression 2',
    variables: [
      { name: 'Number of children', type: 'Int' },
      { name: 'Married', type: 'Boolean' },
    ],
  },
  {
    id: '3',
    name: 'Employment',
    description: 'This is a third descripion',
    type: '',
    addressable_object: 'addressableObject 3',
    object_tree_expression: 'objectTreeExpression 3',
    variables: [
      { name: 'Industry', type: 'Enum' },
      { name: 'Salary', type: 'Int' },
      { name: 'Position', type: 'Enum' },
    ],
  },
  {
    id: '4',
    name: 'Super Users',
    description: 'Users who perform at least 3 purchases during the last week',
    type: '',
    addressable_object: 'addressableObject 4',
    object_tree_expression: 'objectTreeExpression 4',
    variables: [],
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

export type ParametricPredicateType = 'Int' | 'Enum' | 'Boolean' | 'String';

export interface ParametricPredicateVariable<T> {
  name: string;
  type: T;
}

export interface ParametricPredicateResource {
  id: string;
  name: string;
  description: string;
  type: string;
  addressable_object: string;
  object_tree_expression: string;
  variables: Array<ParametricPredicateVariable<ParametricPredicateType>>;
}

export interface ParametricPredicateResource {
  id: string;
  name: string;
  description: string;
  type: string;
  addressable_object: string;
  object_tree_expression: string;
  variables: Array<{ name: string; type: string }>;
}

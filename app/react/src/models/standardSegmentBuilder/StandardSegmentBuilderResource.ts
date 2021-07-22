import { QueryBooleanOperator, SelectionOperation } from '../datamart/graphdb/QueryDocument';
export interface StandardSegmentBuilderResource {
  id: string;
  name: string;
  datamart_id: string;
  // TODO: rename to initial_audience_feature_ids (do backend part before)
  demographics_features_ids: string[];
}

export interface StandardSegmentBuilderGroupNode {
  type: 'GROUP';
  expressions: StandardSegmentBuilderNodeShape[];
  negation?: boolean;
  boolean_operator: QueryBooleanOperator;
}

export interface StandardSegmentBuilderParametricPredicateGroupNode {
  expressions: StandardSegmentBuilderParametricPredicateNode[];
}

export interface StandardSegmentBuilderParametricPredicateNode {
  type: 'PARAMETRIC_PREDICATE';
  parametric_predicate_id: string;
  parameters: {
    [key: string]: string[] | string | number | undefined;
  };
}

export function isStandardSegmentBuilderGroupNode(
  node: StandardSegmentBuilderNodeShape,
): node is StandardSegmentBuilderGroupNode {
  return node.type === 'GROUP';
}

export function isStandardSegmentBuilderParametricPredicateNode(
  node: StandardSegmentBuilderNodeShape,
): node is StandardSegmentBuilderParametricPredicateNode {
  return node.type === 'PARAMETRIC_PREDICATE';
}

export type StandardSegmentBuilderNodeShape =
  | StandardSegmentBuilderGroupNode
  | StandardSegmentBuilderParametricPredicateNode;

export interface StandardSegmentBuilderFormData {
  include: StandardSegmentBuilderParametricPredicateGroupNode[];
  exclude: StandardSegmentBuilderParametricPredicateGroupNode[];
}

export interface StandardSegmentBuilderQueryDocument {
  language_version?: string;
  operations: SelectionOperation[];
  from: string;
  where?: StandardSegmentBuilderNodeShape;
}

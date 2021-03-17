import {
  QueryBooleanOperator,
  SelectionOperation,
} from './../datamart/graphdb/QueryDocument';
export interface AudienceBuilderResource {
  id: string;
  name: string;
  datamart_id: string;
  demographics_features_ids: string[];
}

export interface AudienceBuilderGroupNode {
  type: 'GROUP';
  expressions: AudienceBuilderNodeShape[];
  negation?: boolean;
  boolean_operator: QueryBooleanOperator;
}

export interface AudienceBuilderParametricPredicateGroupNode {
  type: 'GROUP';
  expressions: AudienceBuilderParametricPredicateNode[];
  negation: false;
  boolean_operator: 'OR';
}

export interface AudienceBuilderParametricPredicateNode {
  type: 'PARAMETRIC_PREDICATE';
  parametric_predicate_id: string;
  parameters: {
    [key: string]: string[] | string | number | undefined;
  };
}

export function isAudienceBuilderGroupNode(
  node: AudienceBuilderNodeShape,
): node is AudienceBuilderGroupNode {
  return node.type === 'GROUP';
}

export function isAudienceBuilderParametricPredicateNode(
  node: AudienceBuilderNodeShape,
): node is AudienceBuilderParametricPredicateNode {
  return node.type === 'PARAMETRIC_PREDICATE';
}

export type AudienceBuilderNodeShape =
  | AudienceBuilderGroupNode
  | AudienceBuilderParametricPredicateNode;

export interface AudienceBuilderFormData {
  where: {
    type: 'GROUP';
    boolean_operator: QueryBooleanOperator;
    negation?: boolean;
    expressions: AudienceBuilderNodeShape[];
  };
}

export interface NewAudienceBuilderFormData {
  where: {
    type: 'GROUP';
    boolean_operator: QueryBooleanOperator;
    negation?: boolean;
    expressions: [{
      type: 'GROUP',
      boolean_operator: 'AND',
      negation: false,
      expressions: AudienceBuilderParametricPredicateGroupNode[],
    }, {
      type: 'GROUP',
      boolean_operator: 'AND',
      negation: true,
      expressions: AudienceBuilderParametricPredicateGroupNode[],
    }]
  }
}

export interface AudienceBuilderExcludeFormData {
  parametric_predicates: AudienceBuilderParametricPredicateNode[];
}

export interface QueryDocument {
  language_version?: string;
  operations: SelectionOperation[];
  from: string;
  where?: AudienceBuilderNodeShape;
}

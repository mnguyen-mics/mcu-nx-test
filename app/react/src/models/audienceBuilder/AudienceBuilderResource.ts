import { QueryBooleanOperator, SelectionOperation } from './../datamart/graphdb/QueryDocument';
export interface AudienceBuilderResource {
  id: string;
  name: string;
  datamart_id: string;
}

export interface AudienceBuilderGroupNode {
  type: 'GROUP';
  expressions: AudienceBuilderNodeShape[];
  negation?: boolean;
  boolean_operator: QueryBooleanOperator;
}

export interface AudienceBuilderParametricPredicateNode {
  type: 'PARAMETRIC_PREDICATE';
  parametric_predicate_id: string;
  parameters: {
    [key: string]: string[] | undefined;
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
  datamart_id?: string;
  where: {
    type: 'GROUP';
    boolean_operator: QueryBooleanOperator;
    negation?: boolean;
    expressions: AudienceBuilderNodeShape[];
  };
}

export interface QueryDocument {
  language_version?: string;
  operations: SelectionOperation[];
  from: string;
  where?: AudienceBuilderNodeShape;
}

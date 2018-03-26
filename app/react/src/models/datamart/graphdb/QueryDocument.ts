export type StringComparisonOperator =
  | 'EQ'
  | 'NOT_EQ'
  | 'MATCHES'
  | 'DOES_NOT_MATCH'
  | 'STARTS_WITH'
  | 'DOES_NOT_START_WITH'
  | 'CONTAINS'
  | 'DOES_NOT_CONTAIN';

export type TimeComparisonOperator =
  | 'BEFORE'
  | 'BEFORE_OR_EQUAL'
  | 'AFTER'
  | 'AFTER_OR_EQUAL';

export type QueryFieldComparisonType =
  | 'NUMERIC'
  | 'NUMERIC_INTERVAL'
  | 'STRING'
  | 'TIME'
  | 'TIME_INTERVAL'
  | 'BOOLEAN'
  | 'ENUM';

export type QueryFieldComparisonShape =
  | StringFieldComparison
  | TimeFieldComparison;

export interface StringFieldComparison {
  type: 'STRING';
  operator: StringComparisonOperator;
  value: string;
}

export interface TimeFieldComparison {
  type: 'TIME';
  operator: TimeComparisonOperator;
  values: string[];
}

export type ObjectTreeExpressionNodeShape = FieldNode | GroupNode | ObjectNode | TaxonomyObjectNode;

export interface FieldNode {
  type: 'FIELD';
  field: string;
  comparison?: QueryFieldComparisonShape;
  existence?: QueryFieldExistence;
}

export interface TaxonomyObjectNode {
  type: 'TAXONOMY_OBJECT';
  field: string;
  negation?: boolean;
  expressions: FieldNode[];
}

export interface GroupNode {
  type: 'GROUP';
  expressions: ObjectTreeExpressionNodeShape[];
  negation?: boolean;
  booleanOperator: QueryBooleanOperator;
}

export interface ObjectNode {
  type: 'OBJECT';
  field: string;
  expressions: ObjectTreeExpressionNodeShape[];
  negation?: boolean;
  booleanOperator: QueryBooleanOperator;
  minScore?: number;
  scoreFunction?: 'SUM' | 'AVERAGE' | 'MIN' | 'MAX';
  scoreField?: string;
}

export type QueryBooleanOperator = 'AND' | 'OR';
export type QueryFieldExistence = 'EXISTS' | 'DOES_NOT_EXIST';

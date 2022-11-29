export type StringComparisonOperator =
  | 'EQ'
  | 'NOT_EQ'
  | 'MATCHES'
  | 'DOES_NOT_MATCH'
  | 'STARTS_WITH'
  | 'DOES_NOT_START_WITH'
  | 'CONTAINS'
  | 'DOES_NOT_CONTAIN';

export type TimeComparisonOperator = 'BEFORE' | 'BEFORE_OR_EQUAL' | 'AFTER' | 'AFTER_OR_EQUAL';

export type QueryFieldComparisonType =
  | 'NUMERIC'
  | 'NUMERIC_INTERVAL'
  | 'STRING'
  | 'TIME'
  | 'TIME_INTERVAL'
  | 'BOOLEAN'
  | 'ENUM';

export type EnumComparisonOperator = 'EQUAL' | 'NOT_EQUAL';

export type BooleanComparisonOperator = 'EQUAL' | 'NOT_EQUAL';

export type NumericComparisonOperator = 'EQUAL' | 'NOT_EQUAL' | 'LT' | 'LTE' | 'GT' | 'GTE';

export type QueryFieldComparisonShape =
  | StringFieldComparison
  | TimeFieldComparison
  | BooleanFieldComparison
  | EnumFieldComparison
  | NumericFieldComparison
  | NumericIntervalFieldComparison
  | TimeIntervalFieldComparison;

export interface BooleanFieldComparison {
  type: 'BOOLEAN';
  operator: BooleanComparisonOperator;
  values: string[];
}

export interface EnumFieldComparison {
  type: 'ENUM';
  operator: EnumComparisonOperator;
  values: string[];
}

export interface NumericFieldComparison {
  type: 'NUMERIC';
  operator: NumericFieldComparison;
  values: string[];
}

export interface NumericIntervalFieldComparison {
  type: 'NUMERIC_INTERVAL';
  operator: NumericFieldComparison;
  values: string[];
}

export interface TimeIntervalFieldComparison {
  type: 'TIME_INTERVAL';
  operator: TimeComparisonOperator;
  values: string[];
}

export interface StringFieldComparison {
  type: 'STRING';
  operator: StringComparisonOperator;
  values: string[];
}

export interface TimeFieldComparison {
  type: 'TIME';
  operator: TimeComparisonOperator;
  values: string[];
}

export type ObjectTreeExpressionNodeShape = FieldNode | GroupNode | ObjectNode | TaxonomyObjectNode;

export function isFieldNode(node: ObjectTreeExpressionNodeShape): node is FieldNode {
  return node.type === 'FIELD';
}

export function isObjectNode(node: ObjectTreeExpressionNodeShape): node is ObjectNode {
  return node.type === 'OBJECT';
}

export function isGroupNode(node: ObjectTreeExpressionNodeShape): node is GroupNode {
  return node.type === 'GROUP';
}

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
  expressions: ObjectTreeExpressionNodeShape[];
}

export interface GroupNode {
  type: 'GROUP';
  expressions: ObjectTreeExpressionNodeShape[];
  negation?: boolean;
  boolean_operator: QueryBooleanOperator;
}

export interface ObjectNode {
  type: 'OBJECT';
  field: string;
  expressions: ObjectTreeExpressionNodeShape[];
  negation?: boolean;
  boolean_operator: QueryBooleanOperator;
  min_score?: number;
  score_function?: 'SUM' | 'AVERAGE' | 'MIN' | 'MAX';
  score_field?: string;
}

export type QueryBooleanOperator = 'AND' | 'OR';
export type QueryFieldExistence = 'EXISTS' | 'DOES_NOT_EXIST';

export interface SelectionField {
  name: string;
  selections?: SelectionField[];
  directives?: DirectiveField[];
}

export interface DirectiveField {
  name: string;
}

export interface SelectionOperation {
  selections?: SelectionField[];
  directives?: DirectiveField[];
}

export interface QueryDocument {
  language_version?: string;
  operations: SelectionOperation[];
  // aggregations: Aggregation[],
  from: string;
  where?: ObjectTreeExpressionNodeShape;
}

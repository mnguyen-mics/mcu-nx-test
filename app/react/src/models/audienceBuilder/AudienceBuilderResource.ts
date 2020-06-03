import {
  QueryBooleanOperator,
  QueryFieldComparisonShape,
  ObjectTreeExpressionNodeShape,
} from './../datamart/graphdb/QueryDocument';
export interface AudienceBuilderResource {
  id: string;
  name: string;
  datamart_id: string;
}

interface AudienceBuilderObjectNodeModel {
  type: 'OBJECT';
  field: string;
  expressions: ObjectTreeExpressionNodeShape[];
  negation?: boolean;
  boolean_operator: QueryBooleanOperator;
  min_score?: number;
  score_function?: 'SUM' | 'AVERAGE' | 'MIN' | 'MAX';
  score_field?: string;
}

export interface AudienceBuilderGroupNodeModel {
  type: 'GROUP';
  expressions: AudienceBuilderNodeShape[];
  negation?: boolean;
  boolean_operator: QueryBooleanOperator;
}

export interface AudienceBuilderFieldNodeModel {
  type: 'FIELD';
  field: string;
  comparison?: QueryFieldComparisonShape;
}

type AudienceBuilderNodeModel =
  | AudienceBuilderGroupNodeModel
  | AudienceBuilderFieldNodeModel
  | AudienceBuilderObjectNodeModel;

export function isAudienceBuilderGroupNode(
  nodeModel: AudienceBuilderNodeModel,
): nodeModel is AudienceBuilderGroupNodeModel {
  return nodeModel.type === 'GROUP';
}

export function isAudienceBuilderObjectNode(
  nodeModel: AudienceBuilderNodeModel,
): nodeModel is AudienceBuilderObjectNodeModel {
  return nodeModel.type === 'OBJECT';
}


export function isAudienceBuilderFieldNode(
  node: AudienceBuilderNodeShape,
): node is AudienceBuilderFieldNode {
  return node.model.type === 'FIELD';
}

export interface AudienceBuilderGroupNode {
  key: string;
  model: AudienceBuilderGroupNodeModel;
}
export interface AudienceBuilderFieldNode {
  key: string;
  model: AudienceBuilderFieldNodeModel;
}

export type AudienceBuilderNodeShape =
  | AudienceBuilderFieldNode
  | AudienceBuilderGroupNode;

  
export interface AudienceBuilderFormData {
  where: {
    type: 'GROUP';
    boolean_operator: QueryBooleanOperator;
    negation?: boolean;
    expressions: AudienceBuilderNodeShape[];
  };
}

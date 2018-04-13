import cuid from 'cuid';
import {
  ObjectNode,
  FieldNode,
} from '../../../../models/datamart/graphdb/QueryDocument';
import { FieldArrayModel } from '../../../../utils/FormHelper';
import { Omit } from '../../../../utils/Types';

export interface FieldNodeFormData extends FieldNode {
  key: string;
}

export interface ObjectNodeFormData {
  objectNodeForm: Omit<ObjectNode, 'expressions'>;
  fieldNodeForm?: FieldNodeFormData[];
  untouchedExpressions?: ObjectNode[];
}

export const generateFormDataFromObjectNode = (objectNode: ObjectNode): ObjectNodeFormData => {

  const { expressions, ...rest } = objectNode;
  return {
    objectNodeForm: rest,
    fieldNodeForm: expressions
    .filter(expr => expr.type === 'FIELD')
    .map(expr => ({ ...expr, key: cuid() })) as FieldNodeFormData[],
    untouchedExpressions: expressions
    .filter(expr => expr.type === 'OBJECT') as ObjectNode[]
  }
}

export const generateObjectNodeFromFormData = (formData: ObjectNodeFormData): ObjectNode => {
  const { objectNodeForm, fieldNodeForm } = formData;
  return {
    ...objectNodeForm,
    type: 'OBJECT',
    booleanOperator: objectNodeForm.booleanOperator || 'OR',    
    expressions: [...(fieldNodeForm || []).map(fnf => {
      const { key, ...rest } = fnf;
      return rest;
    }), ...(formData.untouchedExpressions || [])],
  }
}

export const FORM_ID = 'queryDocumentForm';

export type FieldConditionsFieldModel = FieldArrayModel<FieldNode>;

export const QUERY_DOCUMENT_INITIAL_VALUE: ObjectNodeFormData = generateFormDataFromObjectNode(
  {
    booleanOperator: 'OR',
    field: '',
    type: 'OBJECT',
    expressions: [],
  },
);
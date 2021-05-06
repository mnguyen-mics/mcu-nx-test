import cuid from 'cuid';
import { ObjectNode, FieldNode } from '../../../../models/datamart/graphdb/QueryDocument';
import { FieldArrayModel } from '../../../../utils/FormHelper';
import { Omit } from '../../../../utils/Types';

export const SUPPORTED_FIELD_TYPES = [
  'Timestamp',
  'Date',
  'String',
  'Bool',
  'Enum',
  'Number',
  'Float',
  'Int',
  'Double',
  'BigDecimal',
  'ID',
  'FormFactor',
  'HashFunction',
  'BrowserFamily',
  'OperatingSystemFamily',
  'UserAgentType',
  'ActivitySource',
  'UserActivityType',
];

export interface FieldNodeFormData extends FieldNode {
  key: string;
}

export type FrequencyMode = 'AT_LEAST' | 'AT_MOST';

export interface FrequencyFormData {
  enabled: boolean;
  value?: string;
  mode: FrequencyMode;
}

export interface ObjectNodeFormData {
  objectNodeForm: Omit<ObjectNode, 'expressions'>;
  fieldNodeForm?: FieldNodeFormData[];
  untouchedExpressions?: ObjectNode[];
  frequency: FrequencyFormData;
}

export interface FieldNodeFormDataValues {
  fieldNodeForm: FieldNode;
}

export const FrequencyConverter = {
  toFrequency(objectNode: ObjectNode): FrequencyFormData {
    if (objectNode.min_score) {
      return {
        enabled: true,
        mode: 'AT_LEAST',
        value: `${objectNode.min_score}`,
      };
    }
    return {
      enabled: false,
      mode: 'AT_LEAST',
    };
  },

  fromFrequency(frequency: FrequencyFormData): Pick<ObjectNode, 'min_score' | 'score_function'> {
    if (frequency.enabled) {
      return {
        min_score: Number(frequency.value),
        score_function: 'SUM',
      };
    }
    return {
      min_score: undefined,
      score_function: undefined,
    };
  },
};

export const generateFormDataFromObjectNode = (objectNode: ObjectNode): ObjectNodeFormData => {
  const { expressions, ...rest } = objectNode;
  return {
    objectNodeForm: rest,
    fieldNodeForm: expressions
      .filter(expr => expr.type === 'FIELD')
      .map(expr => ({ ...expr, key: cuid() })) as FieldNodeFormData[],
    untouchedExpressions: expressions.filter(expr => expr.type === 'OBJECT') as ObjectNode[],
    frequency: FrequencyConverter.toFrequency(objectNode),
  };
};

export const generateObjectNodeFromFormData = (formData: ObjectNodeFormData): ObjectNode => {
  const { objectNodeForm, fieldNodeForm, frequency } = formData;
  return {
    ...objectNodeForm,
    type: 'OBJECT',
    boolean_operator: objectNodeForm.boolean_operator || 'OR',
    expressions: [
      ...(fieldNodeForm || []).map(fnf => {
        const { key, ...rest } = fnf;
        return rest;
      }),
      ...(formData.untouchedExpressions || []),
    ],
    ...FrequencyConverter.fromFrequency(frequency),
  };
};

export const FORM_ID = 'queryDocumentForm';

export type FieldConditionsFieldModel = FieldArrayModel<FieldNode>;

export const QUERY_DOCUMENT_INITIAL_VALUE: ObjectNodeFormData = generateFormDataFromObjectNode({
  boolean_operator: 'OR',
  field: '',
  type: 'OBJECT',
  expressions: [],
});

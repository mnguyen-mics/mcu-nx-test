import { defineMessages } from 'react-intl';

export default defineMessages({
  save: {
    id: 'queryDocument.actionBar.save',
    defaultMessage: 'Update',
  },
  objectNodeTitle: {
    id: 'queryDocument.objectNode.title',
    defaultMessage: 'Object Node',
  },
  objectNodeSubTitle: {
    id: 'queryDocument.objectNode.subtitle',
    defaultMessage: "Configure your object's properties",
  },
  objectNodeFieldLabel: {
    id: 'queryDocument.objectNode.field.label',
    defaultMessage: 'Type',
  },
  objectNodeFieldPlaceholder: {
    id: 'queryDocument.objectNode.field.placeholder',
    defaultMessage: 'Type',
  },
  objectNodeFieldTooltip: {
    id: 'queryDocument.objectNode.field.tooltip',
    defaultMessage: 'Enter the type of the object you want to base your query upon',
  },
  objectNodeMinScoreLabel: {
    id: 'queryDocument.objectNode.minScore.label',
    defaultMessage: 'Frequency',
  },
  objectNodeMinScorePlaceholder: {
    id: 'queryDocument.objectNode.minScore.placeholder',
    defaultMessage: 'Frequency',
  },
  objectNodeMinScoreTooltip: {
    id: 'queryDocument.objectNode.minScore.tooltip',
    defaultMessage: 'Select the Frequency you want to cap.',
  },
  fieldConditionAdditionButton: {
    id: 'queryDocument.fieldCondition.addition.button',
    defaultMessage: 'Add a Field Condition',
  },
  fieldConditionTitle: {
    id: 'queryDocument.fieldCondition.title',
    defaultMessage: 'Field Conditions',
  },
  fieldConditionSubTitle: {
    id: 'queryDocument.fieldCondition.subtitle',
    defaultMessage: 'Add Field Conditions to the selected object',
  },
  fieldConditionFieldLabel: {
    id: 'queryDocument.fieldCondition.field.label',
    defaultMessage: 'Field Name',
  },
  fieldConditionConditionLabel: {
    id: 'queryDocument.fieldCondition.condition.label',
    defaultMessage: 'Condition',
  },
  fieldConditionValuesLabel: {
    id: 'queryDocument.fieldCondition.values.label',
    defaultMessage: 'Field Values',
  },
  fieldConditionValuesNumberLabel: {
    id: 'queryDocument.fieldCondition.valuesNumbers.label',
    defaultMessage: 'Field Values (Numbers Only)',
  },
  fieldConditionValuesStringLabel: {
    id: 'queryDocument.fieldCondition.valuesString.label',
    defaultMessage: 'Field Values (Strings)',
  },
  fieldConditionMultiValuesTooltip: {
    id: 'queryDocument.fieldCondition.multivalues.tooltip',
    defaultMessage: 'The query will be evaluated to match at least one of the values.',
  },
  fieldConditionValuesTooltip: {
    id: 'queryDocument.fieldCondition.values.tooltip',
    defaultMessage: 'The query will be evaluated to match your value.',
  },
  fieldConditionBooleanOperatorTitle: {
    id: 'queryDocument.fieldCondition.booleanOperator.title',
    defaultMessage: 'Operator',
  },
  fieldTypeNotSupported: {
    id: 'queryDocument.fieldCondition.fieldTypeNotSupported.title',
    defaultMessage: 'Field Type Not Supported',
  },
  EQ: {
    id: 'queryDocument.fieldCondition.condition.EQ',
    defaultMessage: 'Equals',
  },
  NOT_EQ: {
    id: 'queryDocument.fieldCondition.condition.NOT_EQ',
    defaultMessage: 'Does Not Equal',
  },
  MATCHES: {
    id: 'queryDocument.fieldCondition.condition.MATCHES',
    defaultMessage: 'Matches',
  },
  DOES_NOT_MATCH: {
    id: 'queryDocument.fieldCondition.condition.DOES_NOT_MATCH',
    defaultMessage: 'Does Not Match',
  },
  STARTS_WITH: {
    id: 'queryDocument.fieldCondition.condition.STARTS_WITH',
    defaultMessage: 'Starts With',
  },
  DOES_NOT_START_WITH: {
    id: 'queryDocument.fieldCondition.condition.DOES_NOT_START_WITH',
    defaultMessage: 'Does Not Start With',
  },
  CONTAINS: {
    id: 'queryDocument.fieldCondition.condition.CONTAINS',
    defaultMessage: 'Contains',
  },
  DOES_NOT_CONTAIN: {
    id: 'queryDocument.fieldCondition.condition.DOES_NOT_CONTAIN',
    defaultMessage: 'Does Not Contain',
  },
  BEFORE: {
    id: 'queryDocument.fieldCondition.condition.BEFORE',
    defaultMessage: 'Before',
  },
  BEFORE_OR_EQUAL: {
    id: 'queryDocument.fieldCondition.condition.BEFORE_OR_EQUAL',
    defaultMessage: 'Before Or Equal',
  },
  AFTER: {
    id: 'queryDocument.fieldCondition.condition.AFTER',
    defaultMessage: 'After',
  },
  AFTER_OR_EQUAL: {
    id: 'queryDocument.fieldCondition.condition.AFTER_OR_EQUAL',
    defaultMessage: 'After Or Equal',
  },
  EQUAL: {
    id: 'queryDocument.fieldCondition.condition.EQUAL',
    defaultMessage: 'Equals',
  },
  NOT_EQUAL: {
    id: 'queryDocument.fieldCondition.condition.NOT_EQUAL',
    defaultMessage: 'Does Not Equal',
  },
  LT: {
    id: 'queryDocument.fieldCondition.condition.LT',
    defaultMessage: 'Is Less Than',
  },
  LTE: {
    id: 'queryDocument.fieldCondition.condition.LTE',
    defaultMessage: 'Is Less Than Or Equals To',
  },
  GT: {
    id: 'queryDocument.fieldCondition.condition.GT',
    defaultMessage: 'Is Greater Than',
  },
  GTE: {
    id: 'queryDocument.fieldCondition.condition.GTE',
    defaultMessage: 'Is Greater Than Or Equals',
  },
});

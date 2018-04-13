import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { OptionProps } from 'antd/lib/select';
import { getFormValues, Field, GenericField } from 'redux-form';
import {
  FormSelect,
  FormSelectField,
  withNormalizer,
  withValidators,
  FormMultiTagField,
} from '../../../../../../components/Form';
import { compose } from 'recompose';
import { ValidatorProps } from '../../../../../../components/Form/withValidators';
import { NormalizerProps } from '../../../../../../components/Form/withNormalizer';
import messages from '../../messages';
import { FORM_ID, ObjectNodeFormData, FieldNodeFormData } from '../../domain';
import { connect } from 'react-redux';
import {
  BooleanComparisonOperator,
  NumericComparisonOperator,
  EnumComparisonOperator,
  QueryFieldComparisonType,
  StringComparisonOperator,
  TimeComparisonOperator,
} from '../../../../../../models/datamart/graphdb/QueryDocument';
import { FormTagSelectProps } from '../../../../../../components/Form/FormSelect/TagSelect';
import { FieldResource } from '../../../../../../models/datamart/graphdb/RuntimeSchema';
import FormRelativeAbsoluteDate, { FormRelativeAbsoluteDateProps } from './Comparison/FormRelativeAbsoluteDate';

const { DefaultSelect, FormMultiTag, TagSelect } = FormSelect;

export const FormTagSelectField = Field as new() => GenericField<FormTagSelectProps>;
export const FormRelativeAbsoluteDateField = Field as new() => GenericField<FormRelativeAbsoluteDateProps>;

export interface FieldNodeFormProps {
  expressionIndex: number;
  availableFields: FieldResource[];
  name: string;
  formChange: (fieldName: string, value: any) => void;
}

interface MapStateToProps {
  formValues: ObjectNodeFormData;
}

type Props = FieldNodeFormProps &
  InjectedIntlProps &
  ValidatorProps &
  NormalizerProps &
  MapStateToProps;

type ConditionsOperators =
  | NumericComparisonOperator
  | BooleanComparisonOperator
  | EnumComparisonOperator
  | QueryFieldComparisonType
  | TimeComparisonOperator
  | StringComparisonOperator;

class FieldNodeForm extends React.Component<Props> {
  componentWillReceiveProps(nextProps: Props) {
    const { formValues, expressionIndex } = this.props;

    const {
      formValues: nextFormValues,
      expressionIndex: nextExpressionIndex,
      formChange,
      name,
    } = nextProps;

    const field = this.getField(formValues, expressionIndex);
    const fieldName = field ? field.field : undefined;

    const nextField = this.getField(nextFormValues, nextExpressionIndex);
    const nextFieldName = nextField ? nextField.field : undefined

    if (fieldName !== nextFieldName && nextFieldName !== undefined) {
      const fieldType = this.getSelectedFieldType(nextFieldName);
      formChange(
        `${name}.comparison`,
        this.generateFieldTypeComparison(fieldType),
      );
    }
  }

  getField = (formValues: ObjectNodeFormData, index: number): FieldNodeFormData | undefined => {
    return formValues.fieldNodeForm &&
    formValues.fieldNodeForm.length &&
    formValues.fieldNodeForm[index] ?
      formValues.fieldNodeForm[index]
      : undefined;
  }

  generateFieldTypeComparison = (fieldType: string) => {
    switch (fieldType) {
      case 'Timestamp':
        return { type: 'TIME', operator: 'BEFORE', values: [] };
      case 'Date':
        return { type: 'TIME', operator: 'BEFORE', values: [] };
      case 'String':
        return { type: 'STRING', operator: 'EQ', values: [] };
      case 'Bool':
        return { type: 'BOOLEAN', operator: 'EQUAL', values: [] };
      case 'Enum':
        return { type: 'ENUM', operator: 'EQ', values: [] };
      case 'Number':
        return { type: 'NUMERIC', operator: 'EQUAL', values: [] };
    }

    return {};
  };

  getAvailableFields = (): OptionProps[] => {
    const { availableFields } = this.props;
    return availableFields.map(i => {
      return { value: i.name, title: i.name };
    });
  };

  getSelectedFieldType = (fieldName: string) => {
    const { availableFields } = this.props;
    return availableFields.find(
        i => i.name === fieldName,
    )!.field_type.replace('!', '');
  };

  generateStringComparisonOperator = (): Array<{
    value: StringComparisonOperator;
    title: string;
  }> => {
    const { intl } = this.props;

    return [
      {
        value: 'EQ',
        title: intl.formatMessage(messages.EQ),
      },
      {
        value: 'NOT_EQ',
        title: intl.formatMessage(messages.NOT_EQ),
      },
      {
        value: 'MATCHES',
        title: intl.formatMessage(messages.MATCHES),
      },
      {
        value: 'DOES_NOT_MATCH',
        title: intl.formatMessage(messages.DOES_NOT_MATCH),
      },
      {
        value: 'STARTS_WITH',
        title: intl.formatMessage(messages.STARTS_WITH),
      },
      {
        value: 'DOES_NOT_START_WITH',
        title: intl.formatMessage(messages.DOES_NOT_START_WITH),
      },
      {
        value: 'CONTAINS',
        title: intl.formatMessage(messages.CONTAINS),
      },
      {
        value: 'DOES_NOT_CONTAIN',
        title: intl.formatMessage(messages.DOES_NOT_CONTAIN),
      },
    ];
  };

  generateTimeComparisonOperator = (): Array<{
    value: TimeComparisonOperator;
    title: string;
  }> => {
    const { intl } = this.props;

    return [
      {
        value: 'BEFORE',
        title: intl.formatMessage(messages.BEFORE),
      },
      {
        value: 'BEFORE_OR_EQUAL',
        title: intl.formatMessage(messages.BEFORE_OR_EQUAL),
      },
      {
        value: 'AFTER',
        title: intl.formatMessage(messages.AFTER),
      },
      {
        value: 'AFTER_OR_EQUAL',
        title: intl.formatMessage(messages.AFTER_OR_EQUAL),
      },
    ];
  };

  generateEnumComparisonOperator = (): Array<{
    value: EnumComparisonOperator;
    title: string;
  }> => {
    const { intl } = this.props;

    return [
      {
        value: 'EQUAL',
        title: intl.formatMessage(messages.EQUAL),
      },
      {
        value: 'NOT_EQUAL',
        title: intl.formatMessage(messages.EQUAL),
      },
    ];
  };

  generateBooleanComparisonOperator = (): Array<{
    value: BooleanComparisonOperator;
    title: string;
  }> => {
    const { intl } = this.props;

    return [
      {
        value: 'EQUAL',
        title: intl.formatMessage(messages.EQUAL),
      },
      {
        value: 'NOT_EQUAL',
        title: intl.formatMessage(messages.NOT_EQUAL),
      },
    ];
  };

  generateNumericComparisonOperator = (): Array<{
    value: NumericComparisonOperator;
    title: string;
  }> => {
    const { intl } = this.props;
    return [
      {
        value: 'EQUAL',
        title: intl.formatMessage(messages.EQUAL),
      },
      {
        value: 'NOT_EQUAL',
        title: intl.formatMessage(messages.NOT_EQUAL),
      },
      {
        value: 'LT',
        title: intl.formatMessage(messages.LT),
      },
      {
        value: 'LTE',
        title: intl.formatMessage(messages.LTE),
      },
      {
        value: 'GT',
        title: intl.formatMessage(messages.GT),
      },
      {
        value: 'GTE',
        title: intl.formatMessage(messages.GTE),
      },
    ];
  };

  generateAvailableConditionOptions = (fieldName?: string) => {
    const fieldType = fieldName ? this.getSelectedFieldType(fieldName) : undefined;
    switch (fieldType) {
      case 'Timestamp':
        return this.generateTimeComparisonOperator();
      case 'Date':
        return this.generateTimeComparisonOperator();
      case 'String':
        return this.generateStringComparisonOperator();
      case 'Bool':
        return this.generateBooleanComparisonOperator();
      case 'Enum':
        return this.generateEnumComparisonOperator();
      case 'Number':
        return this.generateNumericComparisonOperator();
      default:
        return [];
    }
  };

  generateTimestampComparisonField(condition: TimeComparisonOperator) {
    const { intl, name } = this.props;

    return <FormRelativeAbsoluteDateField
      name={`${name}.comparison.values`}
      component={FormRelativeAbsoluteDate}
      formItemProps={{
        label: intl.formatMessage(messages.fieldConditionValuesLabel),
        required: true,
      }}
      small={true}
      unixTimstamp={true}
    />;
  }

  generateDateComparisonField(condition: TimeComparisonOperator) {
    const { intl, name } = this.props;

    return <FormRelativeAbsoluteDateField
      name={`${name}.comparison.values`}
      component={FormRelativeAbsoluteDate}
      formItemProps={{
        label: intl.formatMessage(messages.fieldConditionValuesLabel),
        required: true,
      }}
      small={true}
    />;
  }

  generateStringComparisonField(condition: StringComparisonOperator) {
    const { intl, name } = this.props;

    return (
      <FormMultiTagField
        name={`${name}.comparison.values`}
        component={FormMultiTag}
        formItemProps={{
          label: intl.formatMessage(messages.fieldConditionValuesStringLabel),
          required: true,
        }}
        selectProps={{
          options: [],
          dropdownStyle: { display: 'none' }
        }}
        helpToolTipProps={{
          title: intl.formatMessage(messages.fieldConditionMultiValuesTooltip),
        }}
        small={true}
        
      />
    );
  }

  generateBooleanComparisonField(condition: BooleanComparisonOperator) {
    const { intl, name } = this.props;

    return (
      <FormTagSelectField
        name={`${name}.comparison.values`}
        component={TagSelect}
        formItemProps={{
          label: intl.formatMessage(messages.fieldConditionValuesLabel),
          required: true,
        }}
        selectProps={{
          options: [{ value: 'true', label: 'true' }, { value: 'false', label: 'false' }],
        }}
        helpToolTipProps={{
          title: intl.formatMessage(messages.fieldConditionMultiValuesTooltip),
        }}
        small={true}
      />
    )
  }

  generateEnumComparisonField(condition: EnumComparisonOperator) {
    const { intl } = this.props;

    return <div>{intl.formatMessage(messages.fieldTypeNotSupported)}</div>;
  }

  generateNumericComparisonField(condition: NumericComparisonOperator) {
    const { intl, name, fieldValidators } = this.props;

    // TODO do multi rendering for equals and not equals, do simple input rendering for the rest
    return (
      <FormMultiTagField
        name={`${name}.comparison.values`}
        component={FormMultiTag}
        validate={[fieldValidators.isRequired, fieldValidators.isValidArrayOfNumber]}
        formItemProps={{
          label: intl.formatMessage(messages.fieldConditionValuesNumberLabel),
          required: true,
        }}
        selectProps={{
          options: [],
          dropdownStyle: { display: 'none' }
        }}
        helpToolTipProps={{
          title: intl.formatMessage(messages.fieldConditionMultiValuesTooltip),
        }}
        small={true}
      />
    )
  }

  generateAvailableConditionField = (
    fieldName: string,
    condition: ConditionsOperators,
  ) => {
    const fieldType = this.getSelectedFieldType(fieldName);
    switch (fieldType) {
      case 'Timestamp':
        return this.generateTimestampComparisonField(
          condition as TimeComparisonOperator,
        );
      case 'Date':
        return this.generateDateComparisonField(
          condition as TimeComparisonOperator,
        );
      case 'String':
        return this.generateStringComparisonField(
          condition as StringComparisonOperator,
        );
      case 'Bool':
        return this.generateBooleanComparisonField(
          condition as BooleanComparisonOperator,
        );
      case 'Enum':
        return this.generateEnumComparisonField(
          condition as EnumComparisonOperator,
        );
      case 'Number':
        return this.generateNumericComparisonField(
          condition as NumericComparisonOperator,
        );
      default:
        return [];
    }
  };

  render() {
    const {
      expressionIndex,
      fieldValidators: { isRequired },
      intl,
      formValues,
      name,
    } = this.props;

    const field = this.getField(formValues, expressionIndex);
    const hasSelectedAField = field && field.field !== '';
    const fieldName = field ? field.field : undefined;
    const fieldCondition = field && field.comparison && field.comparison.operator ? field.comparison.operator as ConditionsOperators : undefined ;

    return (
      <div>
        <FormSelectField
          name={`${name}.field`}
          component={DefaultSelect}
          validate={[isRequired]}
          options={this.getAvailableFields()}
          formItemProps={{
            label: intl.formatMessage(messages.fieldConditionFieldLabel),
            required: true,
          }}
          small={true}
        />
        <FormSelectField
          name={`${name}.comparison.operator`}
          component={DefaultSelect}
          validate={[]}
          options={this.generateAvailableConditionOptions(fieldName)}
          formItemProps={{
            label: intl.formatMessage(messages.fieldConditionConditionLabel),
          }}
          selectProps={{
            notFoundContent: intl.formatMessage(messages.fieldTypeNotSupported),
          }}
          small={true}
          disabled={!hasSelectedAField}
        />
        {fieldName &&
          fieldCondition &&
          this.generateAvailableConditionField(fieldName, fieldCondition)}
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  formValues: getFormValues(FORM_ID)(state),
});

export default compose<Props, FieldNodeFormProps>(
  injectIntl,
  withValidators,
  withNormalizer,
  connect(mapStateToProps),
)(FieldNodeForm);

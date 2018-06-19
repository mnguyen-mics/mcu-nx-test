import { OptionProps } from 'antd/lib/select';
import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { Field, GenericField, getFormValues } from 'redux-form';
import {
  DefaultSelect,
  FormMultiTagField,
  FormSelectField,
  withNormalizer,
  withValidators,
} from '../../../../../../components/Form';
import FormMultiTag from '../../../../../../components/Form/FormSelect/FormMultiTag';
import FormSearchObject, {
  FormSearchObjectProps,
} from '../../../../../../components/Form/FormSelect/FormSearchObject';
import TagSelect, {
  FormTagSelectProps,
} from '../../../../../../components/Form/FormSelect/TagSelect';
import { NormalizerProps } from '../../../../../../components/Form/withNormalizer';
import { ValidatorProps } from '../../../../../../components/Form/withValidators';
import {
  BooleanComparisonOperator,
  EnumComparisonOperator,
  NumericComparisonOperator,
  QueryFieldComparisonType,
  StringComparisonOperator,
  TimeComparisonOperator,
} from '../../../../../../models/datamart/graphdb/QueryDocument';
import {
  FieldResource,
  ObjectLikeTypeInfoResource,
} from '../../../../../../models/datamart/graphdb/RuntimeSchema';
import AudienceSegmentService from '../../../../../../services/AudienceSegmentService';
import {
  FORM_ID,
  FieldNodeFormData,
  ObjectNodeFormData,
  SUPPORTED_FIELD_TYPES,
} from '../../domain';
import messages from '../../messages';
import FormRelativeAbsoluteDate, {
  FormRelativeAbsoluteDateProps,
} from './Comparison/FormRelativeAbsoluteDate';

export const FormTagSelectField = Field as new () => GenericField<
  FormTagSelectProps
>;
export const FormRelativeAbsoluteDateField = Field as new () => GenericField<
  FormRelativeAbsoluteDateProps
>;
export const FormSearchObjectField = Field as new () => GenericField<
  FormSearchObjectProps
>;

export interface FieldNodeFormProps {
  expressionIndex?: number;
  availableFields: FieldResource[];
  name?: string;
  formChange: (fieldName: string, value: any) => void;
  objectType: ObjectLikeTypeInfoResource;
  idToAttachDropDowns?: string;
}

interface MapStateToProps {
  formValues: ObjectNodeFormData;
}

type Props = FieldNodeFormProps &
  InjectedIntlProps &
  ValidatorProps &
  NormalizerProps &
  MapStateToProps &
  RouteComponentProps<{ organisationId: string }>;

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
    const nextFieldName = nextField ? nextField.field : undefined;

    if (fieldName !== nextFieldName && nextFieldName !== undefined) {
      const fieldType = this.getSelectedFieldType(nextFieldName);
      formChange(
        name ? `${name}.comparison` : 'comparison',
        this.generateFieldTypeComparison(fieldType),
      );
    }
  }

  getField = (
    formValues: ObjectNodeFormData,
    index?: number,
  ): FieldNodeFormData | undefined => {
    if (index !== undefined) {
      return formValues.fieldNodeForm &&
        formValues.fieldNodeForm.length &&
        formValues.fieldNodeForm[index]
        ? formValues.fieldNodeForm[index]
        : undefined;
    }
    return formValues.fieldNodeForm
      ? ((formValues as any).fieldNodeForm as FieldNodeFormData)
      : undefined;
  };

  generateFieldTypeComparison = (fieldType: string | null) => {
    switch (fieldType) {
      case 'Timestamp':
        return { type: 'TIME', operator: 'BEFORE', values: [] };
      case 'Date':
        return { type: 'TIME', operator: 'BEFORE', values: [] };
      case 'String':
        return { type: 'STRING', operator: 'EQ', values: [] };
      case 'Bool':
        return { type: 'BOOLEAN', operator: 'EQUAL', values: [] };
      case 'Boolean':
        return { type: 'BOOLEAN', operator: 'EQUAL', values: [] };
      case 'Enum':
        return { type: 'ENUM', operator: 'EQ', values: [] };
      case 'Number':
        return { type: 'NUMERIC', operator: 'EQUAL', values: [] };
      case 'Float':
        return { type: 'NUMERIC', operator: 'EQUAL', values: [] };
      case 'Int':
        return { type: 'NUMERIC', operator: 'EQUAL', values: [] };
      case 'Double':
        return { type: 'NUMERIC', operator: 'EQUAL', values: [] };
      case 'BigDecimal':
        return { type: 'NUMERIC', operator: 'EQUAL', values: [] };
      case 'ID':
        return { type: 'STRING', operator: 'EQ', values: [] };
      default:
        return {};
    }
  };

  getAvailableFields = (): OptionProps[] => {
    const { availableFields } = this.props;
    return availableFields
      .filter(field =>
        SUPPORTED_FIELD_TYPES.find(t => field.field_type.indexOf(t) > -1),
      )
      .map(i => ({ value: i.name, title: i.name }));
  };

  getSelectedFieldType = (fieldName: string) => {
    const { availableFields } = this.props;

    const fieldType = availableFields.find(i => i.name === fieldName)!
      .field_type;

    const match = fieldType.match(/\w+/);
    return match && match[0];
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
      // {
      //   value: 'MATCHES',
      //   title: intl.formatMessage(messages.MATCHES),
      // },
      // {
      //   value: 'DOES_NOT_MATCH',
      //   title: intl.formatMessage(messages.DOES_NOT_MATCH),
      // },
      // {
      //   value: 'STARTS_WITH',
      //   title: intl.formatMessage(messages.STARTS_WITH),
      // },
      // {
      //   value: 'DOES_NOT_START_WITH',
      //   title: intl.formatMessage(messages.DOES_NOT_START_WITH),
      // },
      // {
      //   value: 'CONTAINS',
      //   title: intl.formatMessage(messages.CONTAINS),
      // },
      // {
      //   value: 'DOES_NOT_CONTAIN',
      //   title: intl.formatMessage(messages.DOES_NOT_CONTAIN),
      // },
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
    const fieldType = fieldName
      ? this.getSelectedFieldType(fieldName)
      : undefined;
    switch (fieldType) {
      case 'Timestamp':
        return this.generateTimeComparisonOperator();
      case 'Date':
        return this.generateTimeComparisonOperator();
      case 'String':
        return this.generateStringComparisonOperator();
      case 'Bool':
        return this.generateBooleanComparisonOperator();
      case 'Boolean':
        return this.generateBooleanComparisonOperator();
      case 'Enum':
        return this.generateEnumComparisonOperator();
      case 'Number':
        return this.generateNumericComparisonOperator();
      case 'Float':
        return this.generateNumericComparisonOperator();
      case 'Int':
        return this.generateNumericComparisonOperator();
      case 'Double':
        return this.generateNumericComparisonOperator();
      case 'BigDecimal':
        return this.generateNumericComparisonOperator();
      case 'ID':
        return this.generateStringComparisonOperator();
      default:
        return [];
    }
  };

  generateTimestampComparisonField(condition: TimeComparisonOperator) {
    const { intl, name, idToAttachDropDowns } = this.props;


    let popUpProps = {};

    if (idToAttachDropDowns) {
      popUpProps = {
        getCalendarContainer: (e: HTMLElement) =>
          document.getElementById(idToAttachDropDowns)!,
      };
    }

    return (
      <FormRelativeAbsoluteDateField
        name={name ? `${name}.comparison.values` : 'comparison.values'}
        component={FormRelativeAbsoluteDate}
        formItemProps={{
          label: intl.formatMessage(messages.fieldConditionValuesLabel),
          required: true,
        }}
        datePickerProps={{
          ...popUpProps
        }}
        small={true}
        unixTimstamp={true}
      />
    );
  }

  generateDateComparisonField(condition: TimeComparisonOperator) {
    const { intl, name, idToAttachDropDowns } = this.props;

    let popUpProps = {};

    if (idToAttachDropDowns) {
      popUpProps = {
        getCalendarContainer: (e: HTMLElement) =>
          document.getElementById(idToAttachDropDowns)!,
      };
    }

    return (
      <FormRelativeAbsoluteDateField
        name={name ? `${name}.comparison.values` : 'comparison.values'}
        component={FormRelativeAbsoluteDate}
        formItemProps={{
          label: intl.formatMessage(messages.fieldConditionValuesLabel),
          required: true,
        }}
        datePickerProps={{
          ...popUpProps
        }}
        small={true}
      />
    );
  }

  generateStringComparisonField(condition: StringComparisonOperator) {
    const { intl, name, idToAttachDropDowns } = this.props;

    let popUpProps = {};

    if (idToAttachDropDowns) {
      popUpProps = {
        getPopupContainer: (e: HTMLElement) =>
          document.getElementById(idToAttachDropDowns)!,
      };
    }

    return (
      <FormMultiTagField
        name={name ? `${name}.comparison.values` : 'comparison.values'}
        component={FormMultiTag}
        formItemProps={{
          label: intl.formatMessage(messages.fieldConditionValuesStringLabel),
          required: true,
        }}
        selectProps={{
          options: [],
          dropdownStyle: { display: 'none' },
          ...popUpProps
        }}
        helpToolTipProps={{
          title: intl.formatMessage(messages.fieldConditionMultiValuesTooltip),
        }}
        small={true}
      />
    );
  }

  generateBooleanComparisonField(condition: BooleanComparisonOperator) {
    const { intl, name, idToAttachDropDowns } = this.props;

    let popUpProps = {};

    if (idToAttachDropDowns) {
      popUpProps = {
        getPopupContainer: (e: HTMLElement) =>
          document.getElementById(idToAttachDropDowns)!,
      };
    }

    return (
      <FormTagSelectField
        name={name ? `${name}.comparison.values` : 'comparison.values'}
        component={TagSelect}
        formItemProps={{
          label: intl.formatMessage(messages.fieldConditionValuesLabel),
          required: true,
        }}
        selectProps={{
          options: [
            { value: 'true', label: 'true' },
            { value: 'false', label: 'false' },
          ],
          ...popUpProps,
        }}
        helpToolTipProps={{
          title: intl.formatMessage(messages.fieldConditionMultiValuesTooltip),
        }}
        small={true}
      />
    );
  }

  generateEnumComparisonField(condition: EnumComparisonOperator) {
    const { intl } = this.props;

    return <div>{intl.formatMessage(messages.fieldTypeNotSupported)}</div>;
  }

  generateNumericComparisonField(condition: NumericComparisonOperator) {
    const { intl, name, fieldValidators, idToAttachDropDowns } = this.props;

    let popUpProps = {};

    if (idToAttachDropDowns) {
      popUpProps = {
        getPopupContainer: (e: HTMLElement) =>
          document.getElementById(idToAttachDropDowns)!,
      };
    }

    // TODO do multi rendering for equals and not equals, do simple input rendering for the rest
    return (
      <FormMultiTagField
        name={name ? `${name}.comparison.values` : 'comparison.values'}
        component={FormMultiTag}
        validate={[
          fieldValidators.isRequired,
          fieldValidators.isValidArrayOfNumber,
        ]}
        formItemProps={{
          label: intl.formatMessage(messages.fieldConditionValuesNumberLabel),
          required: true,
        }}
        selectProps={{
          options: [],
          dropdownStyle: { display: 'none' },
          ...popUpProps
        }}
        helpToolTipProps={{
          title: intl.formatMessage(messages.fieldConditionMultiValuesTooltip),
        }}
        small={true}
      />
    );
  }

  generateIdComparisonField(condition: StringComparisonOperator) {
    const {
      intl,
      name,
      match: {
        params: { organisationId },
      },
      objectType,
      idToAttachDropDowns,
    } = this.props;

    const fetchListMethod = (keywords: string) =>
      AudienceSegmentService.getSegments(organisationId, { keywords }).then(
        res => res.data.map(r => ({ key: r.id, label: r.name })),
      );
    const fetchSingleMethod = (id: string) =>
      AudienceSegmentService.getSegment(id).then(res => ({
        key: res.data.id,
        label: res.data.name,
      }));

    let popUpProps = {};

    if (idToAttachDropDowns) {
      popUpProps = {
        getPopupContainer: (e: HTMLElement) =>
          document.getElementById(idToAttachDropDowns)!,
      };
    }

    return objectType.name === 'UserSegment' ? (
      <FormSearchObjectField
        name={name ? `${name}.comparison.values` : 'comparison.values'}
        component={FormSearchObject}
        formItemProps={{
          label: intl.formatMessage(messages.fieldConditionValuesStringLabel),
          required: true,
        }}
        fetchListMethod={fetchListMethod}
        fetchSingleMethod={fetchSingleMethod}
        helpToolTipProps={{
          title: intl.formatMessage(messages.fieldConditionMultiValuesTooltip),
        }}
        selectProps={{
          ...popUpProps,
        }}
        small={true}
      />
    ) : (
      this.generateStringComparisonField(condition)
    );
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
      case 'ID':
        return this.generateIdComparisonField(
          condition as StringComparisonOperator,
        );
      case 'Bool':
        return this.generateBooleanComparisonField(
          condition as BooleanComparisonOperator,
        );
      case 'Boolean':
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
      case 'Float':
        return this.generateNumericComparisonField(
          condition as NumericComparisonOperator,
        );
      case 'Int':
        return this.generateNumericComparisonField(
          condition as NumericComparisonOperator,
        );
      case 'Double':
        return this.generateNumericComparisonField(
          condition as NumericComparisonOperator,
        );
      case 'BigDecimal':
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
      idToAttachDropDowns,
    } = this.props;

    const field = this.getField(formValues, expressionIndex);
    const hasSelectedAField = field && field.field !== '';
    const fieldName = field ? field.field : undefined;
    const fieldCondition =
      field && field.comparison && field.comparison.operator
        ? (field.comparison.operator as ConditionsOperators)
        : undefined;

    let popUpProps = {};

    if (idToAttachDropDowns) {
      popUpProps = {
        getPopupContainer: (e: HTMLElement) =>
          document.getElementById(idToAttachDropDowns)!,
      };
    }

    return (
      <div>
        <FormSelectField
          name={name ? `${name}.field` : 'field'}
          component={DefaultSelect}
          validate={[isRequired]}
          options={this.getAvailableFields()}
          formItemProps={{
            label: intl.formatMessage(messages.fieldConditionFieldLabel),
            required: true,
          }}
          selectProps={{
            ...popUpProps,
          }}
          small={true}
        />
        <FormSelectField
          name={name ? `${name}.comparison.operator` : 'comparison.operator'}
          component={DefaultSelect}
          validate={[]}
          options={this.generateAvailableConditionOptions(fieldName)}
          formItemProps={{
            label: intl.formatMessage(messages.fieldConditionConditionLabel),
          }}
          selectProps={{
            notFoundContent: intl.formatMessage(messages.fieldTypeNotSupported),
            ...popUpProps,
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
  withRouter,
  injectIntl,
  withValidators,
  withNormalizer,
  connect(mapStateToProps),
)(FieldNodeForm);

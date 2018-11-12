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
import {
  FORM_ID,
  FieldNodeFormData,
  SUPPORTED_FIELD_TYPES,
} from '../../domain';
import messages from '../../messages';
import FormRelativeAbsoluteDate, {
  FormRelativeAbsoluteDateProps,
} from './Comparison/FormRelativeAbsoluteDate';
import constants, { ComparisonValues } from './contants';
import { injectable } from 'inversify';
import { IAudienceSegmentService } from '../../../../../../services/AudienceSegmentService';
import { TYPES } from '../../../../../../constants/types';
import { lazyInject } from '../../../../../../config/inversify.config';

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

interface FormValues {
  fieldNodeForm: FieldNodeFormData[] | FieldNodeFormData;
}

interface MapStateToProps {
  formValues: FormValues;
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

type FieldComparisonGenerator = ComparisonValues<any> & {
  component: React.ReactNode;
};

@injectable()
class FieldNodeForm extends React.Component<Props> {
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;
  componentDidMount() {
    // if no default value compute it
    const { formValues, expressionIndex, formChange, name } = this.props;

    const field = this.getField(formValues, expressionIndex);

    if (field && !field.comparison) {
      const fieldName = field ? field.field : undefined;
      const fieldType = this.getSelectedFieldType(fieldName);
      formChange(
        name ? `${name}.comparison` : 'comparison',
        this.generateAvailableConditionOptions(fieldType).defaultValue,
      );
    }
  }

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
        this.generateAvailableConditionOptions(fieldType).defaultValue,
      );
    }
  }

  getField = (
    formValues: FormValues,
    index?: number,
  ): FieldNodeFormData | undefined => {
    const { fieldNodeForm } = formValues;

    if (Array.isArray(fieldNodeForm)) {
      if (index !== undefined && fieldNodeForm[index]) {
        return fieldNodeForm[index];
      }
    } else {
      return fieldNodeForm;
    }
    return undefined;
  };

  getAvailableFields = (): OptionProps[] => {
    const { availableFields } = this.props;
    return availableFields
      .filter(field =>
        SUPPORTED_FIELD_TYPES.find(t => field.field_type.indexOf(t) > -1),
      )
      .map(i => ({ value: i.name, title: i.name }));
  };

  getSelectedFieldType = (fieldName: string | undefined) => {
    const { availableFields } = this.props;

    const possibleFieldType = availableFields.find(i => i.name === fieldName);
    if (possibleFieldType) {
      const fieldType = possibleFieldType.field_type;
      const match = fieldType.match(/\w+/);
      return match && match[0];
    }
    return null;
  };

  generateAvailableConditionOptions = (
    fieldType: string | null,
  ): FieldComparisonGenerator => {
    const { intl } = this.props;

    switch (fieldType) {
      case 'Timestamp':
        return {
          ...constants.generateTimeComparisonOperator(intl),
          component: this.generateTimestampComparisonField(),
        };
      case 'Date':
        return {
          ...constants.generateTimeComparisonOperator(intl),
          component: this.generateTimestampComparisonField(),
        };
      case 'String':
        return {
          ...constants.generateStringComparisonOperator(intl),
          component: this.generateStringComparisonField(),
        };
      case 'Bool':
        return {
          ...constants.generateBooleanComparisonOperator(intl),
          component: this.generateBooleanComparisonField(),
        };
      case 'Boolean':
        return {
          ...constants.generateBooleanComparisonOperator(intl),
          component: this.generateBooleanComparisonField(),
        };
      case 'Enum':
        return {
          ...constants.generateEnumComparisonOperator(intl),
          component: this.generateEnumComparisonField(),
        };
      case 'Number':
        return {
          ...constants.generateNumericComparisonOperator(intl),
          component: this.generateNumericComparisonField(),
        };
      case 'Float':
        return {
          ...constants.generateNumericComparisonOperator(intl),
          component: this.generateNumericComparisonField(),
        };
      case 'Int':
        return {
          ...constants.generateNumericComparisonOperator(intl),
          component: this.generateNumericComparisonField(),
        };
      case 'Double':
        return {
          ...constants.generateNumericComparisonOperator(intl),
          component: this.generateNumericComparisonField(),
        };
      case 'BigDecimal':
        return {
          ...constants.generateNumericComparisonOperator(intl),
          component: this.generateNumericComparisonField(),
        };
      case 'ID':
        return {
          ...constants.generateStringComparisonOperator(intl),
          component: this.generateIdComparisonField(),
        };
      default:
        return {
          values: [],
          defaultValue: undefined,
          component: undefined,
        };
    }
  };

  generateTimestampComparisonField() {
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
          ...popUpProps,
        }}
        small={true}
        unixTimstamp={true}
      />
    );
  }

  generateDateComparisonField() {
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
          ...popUpProps,
        }}
        small={true}
      />
    );
  }

  generateStringComparisonField() {
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
          ...popUpProps,
        }}
        helpToolTipProps={{
          title: intl.formatMessage(messages.fieldConditionMultiValuesTooltip),
        }}
        small={true}
      />
    );
  }

  generateBooleanComparisonField() {
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

  generateEnumComparisonField() {
    const { intl } = this.props;

    return <div>{intl.formatMessage(messages.fieldTypeNotSupported)}</div>;
  }

  generateNumericComparisonField() {
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
          ...popUpProps,
        }}
        helpToolTipProps={{
          title: intl.formatMessage(messages.fieldConditionMultiValuesTooltip),
        }}
        small={true}
      />
    );
  }

  generateIdComparisonField() {
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
      this._audienceSegmentService
        .getSegments(organisationId, { keywords })
        .then(res => res.data.map(r => ({ key: r.id, label: r.name })));
    const fetchSingleMethod = (id: string) =>
      this._audienceSegmentService.getSegment(id).then(res => ({
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
      this.generateStringComparisonField()
    );
  }

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
    const fieldName = field ? field.field : '';
    const fieldCondition =
      field && field.comparison && field.comparison.operator
        ? (field.comparison.operator as ConditionsOperators)
        : undefined;
    const fieldType = this.getSelectedFieldType(fieldName);

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
          options={this.generateAvailableConditionOptions(fieldType).values}
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
          this.generateAvailableConditionOptions(fieldType).component}
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

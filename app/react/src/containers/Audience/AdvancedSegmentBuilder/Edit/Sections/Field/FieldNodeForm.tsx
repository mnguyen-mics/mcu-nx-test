import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
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
  ObjectLikeTypeInfoResource,
  FieldInfoResource,
  FieldDirectiveResource,
  BuitinEnumerationType,
} from '../../../../../../models/datamart/graphdb/RuntimeSchema';
import { FORM_ID, FieldNodeFormData, SUPPORTED_FIELD_TYPES } from '../../domain';
import messages from '../../messages';
import FormRelativeAbsoluteDate, {
  FormRelativeAbsoluteDateProps,
} from './Comparison/FormRelativeAbsoluteDate';
import constants, { ComparisonValues, builtinEnumTypeOptions } from './contants';
import { IAudienceSegmentService } from '../../../../../../services/AudienceSegmentService';
import { TYPES } from '../../../../../../constants/types';
import { lazyInject } from '../../../../../../config/inversify.config';
import { SegmentNameDisplay } from '../../../../Common/SegmentNameDisplay';
import { IDatamartService } from '../../../../../../services/DatamartService';
import { IComparmentService } from '../../../../../../services/CompartmentService';
import { getCoreReferenceTypeAndModel, FieldProposalLookup } from '../../../domain';
import { IChannelService } from '../../../../../../services/ChannelService';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';
import { IReferenceTableService } from '../../../../../../services/ReferenceTableService';
import { injectWorkspace, InjectedWorkspaceProps } from '../../../../../Datamart';
import { FormInfiniteSearchObjectProps } from '../../../../../../components/Form/FormSelect/FormInfiniteSearchObject';
import { DefaultOptionProps } from '../../../../../../components/Form/FormSelect/DefaultSelect';

export const FormTagSelectField = Field as new () => GenericField<FormTagSelectProps>;
export const FormRelativeAbsoluteDateField =
  Field as new () => GenericField<FormRelativeAbsoluteDateProps>;
export const FormSearchObjectField = Field as new () => GenericField<FormSearchObjectProps>;
export const FormInfiniteSearchObjectField =
  Field as new () => GenericField<FormInfiniteSearchObjectProps>;

export interface FieldNodeFormProps {
  expressionIndex?: number;
  availableFields: FieldInfoResource[];
  name?: string;
  formChange: (fieldName: string, value: any) => void;
  objectType: ObjectLikeTypeInfoResource;
  idToAttachDropDowns?: string;
  runtimeSchemaId: string;
  datamartId: string;
  formName?: string;
  runFieldProposal?: FieldProposalLookup;
  treeNodePath?: number[];
  disabled?: boolean;
  isEdge?: boolean;
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
  InjectedWorkspaceProps &
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
  fetchPredicate?: Promise<{ value: string; name: string; disabled: boolean }>;
};

interface State {}

class FieldNodeForm extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  @lazyInject(TYPES.ICompartmentService)
  private _compartmentService: IComparmentService;

  @lazyInject(TYPES.IChannelService)
  private _channelService: IChannelService;

  @lazyInject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;

  @lazyInject(TYPES.IReferenceTableService)
  private _referenceTableService: IReferenceTableService;

  private _computedTreeNodePath: number[];

  constructor(props: Props) {
    super(props);
    this.state = {};
    if (props.treeNodePath) {
      this._computedTreeNodePath = props.treeNodePath;
    }
  }

  componentDidMount() {
    // if no default value compute it
    const { formValues, expressionIndex, formChange, name, treeNodePath, isEdge } = this.props;

    if (treeNodePath) {
      this._computedTreeNodePath = treeNodePath;
    }

    const field = this.getField(formValues, expressionIndex);
    const directive = field ? this.getFieldDirective(field.field) : undefined;

    if (field && !field.comparison) {
      const fieldName = field.field;
      const fieldType = this.getSelectedFieldType(fieldName);
      const fieldIndexDataType = this.getSelectedFieldIndexDataType(fieldName);
      formChange(
        name ? `${name}.comparison` : 'comparison',
        this.generateAvailableConditionOptions(fieldType, fieldIndexDataType, directive, isEdge)
          .defaultValue,
      );
    }
  }

  fetchPredicates = (treeNodePath: number[], fieldName: string) => {
    const { runFieldProposal } = this.props;
    if (!runFieldProposal) {
      return Promise.resolve([]);
    }

    return runFieldProposal(treeNodePath, fieldName);
  };

  componentDidUpdate(previousProps: Props) {
    const { formValues, expressionIndex, formChange, name, isEdge } = this.props;

    const { formValues: previousFormValues, expressionIndex: previousExpressionIndex } =
      previousProps;

    const field = this.getField(formValues, expressionIndex);
    const fieldName = field ? field.field : undefined;
    const directive = field ? this.getFieldDirective(field.field) : undefined;

    const previousField = this.getField(previousFormValues, previousExpressionIndex);
    const previousFieldName = previousField ? previousField.field : undefined;

    if (fieldName !== previousFieldName && fieldName !== undefined) {
      const fieldType = this.getSelectedFieldType(fieldName);
      const fieldIndexDataType = this.getSelectedFieldIndexDataType(fieldName);

      formChange(
        name ? `${name}.comparison` : 'comparison',
        this.generateAvailableConditionOptions(fieldType, fieldIndexDataType, directive, isEdge)
          .defaultValue,
      );
    }
  }

  getField = (formValues: FormValues, index?: number): FieldNodeFormData | undefined => {
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

  getAvailableFields = (): DefaultOptionProps[] => {
    const { availableFields } = this.props;
    return availableFields
      .filter(field => SUPPORTED_FIELD_TYPES.find(t => field.field_type.indexOf(t) > -1))
      .map(i => ({
        value: i.name,
        title: i.decorator && i.decorator.hidden === false ? i.decorator.label : i.name,
      }));
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

  getSelectedIndex = (fieldName: string | undefined) => {
    const { availableFields } = this.props;
    const possibleFieldIndex = availableFields.findIndex(i => i.name === fieldName);
    if (possibleFieldIndex > -1) {
      return possibleFieldIndex;
    }
    return null;
  };

  getSelectedFieldIndexDataType = (fieldName: string | undefined) => {
    const { availableFields } = this.props;

    const possibleFieldType = availableFields.find(i => i.name === fieldName);
    if (possibleFieldType) {
      const indexDirective = possibleFieldType.directives.find(d => d.name === 'TreeIndex');
      if (indexDirective) {
        const dataTypeDirArg = indexDirective.arguments.find(arg => arg.name === 'data_type');
        if (dataTypeDirArg) {
          const match = dataTypeDirArg.value.match(/\w+/);
          return match && match[0];
        }
        return null;
      }
      return null;
    }
    return null;
  };

  generateAvailableConditionOptions = (
    fieldType: string | null,
    fieldIndexDataType: string | null,
    directives?: FieldDirectiveResource[],
    isEdge?: boolean,
  ): FieldComparisonGenerator => {
    const { intl } = this.props;

    const shouldRenderDirective = (
      renderDefault: JSX.Element,
      fetchPredicates: boolean = false,
    ) => {
      if (directives) {
        const modelAndType = getCoreReferenceTypeAndModel(directives);
        if (modelAndType) {
          return this.generateReferenceTableComparisonField(
            modelAndType.type,
            modelAndType.modelType,
          );
        }
      }
      if (fetchPredicates) {
        return this.generateReferenceTableComparisonField('COMPUTED');
      }
      return renderDefault;
    };

    switch (fieldType) {
      case 'Timestamp':
      case 'Date':
        return {
          ...constants.generateTimeComparisonOperator(intl),
          component: shouldRenderDirective(this.generateTimestampComparisonField()),
        };
      case 'String':
        return {
          ...constants.generateStringComparisonOperator(
            intl,
            fieldIndexDataType || undefined,
            isEdge,
          ),
          component: shouldRenderDirective(this.generateStringComparisonField(), true),
          fetchPredicate: undefined,
        };
      case 'Bool':
      case 'Boolean':
        return {
          ...constants.generateBooleanComparisonOperator(intl),
          component: shouldRenderDirective(this.generateBooleanComparisonField()),
        };
      case 'Enum':
        return {
          ...constants.generateEnumComparisonOperator(intl),
          component: shouldRenderDirective(this.generateEnumComparisonField()),
        };
      case 'Number':
      case 'Float':
      case 'Int':
      case 'Double':
      case 'BigDecimal':
        return {
          ...constants.generateNumericComparisonOperator(intl),
          component: shouldRenderDirective(this.generateNumericComparisonField()),
        };
      case 'ID':
        return {
          ...constants.generateStringComparisonOperator(intl),
          component: shouldRenderDirective(this.generateIdComparisonField()),
        };
      case 'OperatingSystemFamily':
      case 'FormFactor':
      case 'HashFunction':
      case 'BrowserFamily':
      case 'UserAgentType':
      case 'ActivitySource':
      case 'UserActivityType':
        return {
          ...constants.generateEnumComparisonOperator(intl),
          component: shouldRenderDirective(
            this.generateTagSelectComparisonField(
              (builtinEnumTypeOptions[fieldType as BuitinEnumerationType] as string[]).map(v => ({
                label: v,
                value: v,
              })),
            ),
          ),
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
    const { intl, name, idToAttachDropDowns, disabled, formValues, expressionIndex } = this.props;

    let popUpProps = {};

    if (idToAttachDropDowns) {
      popUpProps = {
        getCalendarContainer: (e: HTMLElement) => document.getElementById(idToAttachDropDowns)!,
      };
    }

    const field = this.getField(formValues, expressionIndex);
    const comparisonOperatorValue = field?.comparison?.operator;

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
        disabled={disabled}
        dateComparisonOperator={comparisonOperatorValue}
      />
    );
  }

  generateDateComparisonField() {
    const { intl, name, idToAttachDropDowns } = this.props;

    let popUpProps = {};

    if (idToAttachDropDowns) {
      popUpProps = {
        getCalendarContainer: (e: HTMLElement) => document.getElementById(idToAttachDropDowns)!,
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
    const { intl, name, fieldValidators } = this.props;

    return (
      <FormMultiTagField
        name={name ? `${name}.comparison.values` : 'comparison.values'}
        component={FormMultiTag}
        formItemProps={{
          label: intl.formatMessage(messages.fieldConditionValuesStringLabel),
          required: true,
        }}
        validate={[fieldValidators.isRequired]}
        helpToolTipProps={{
          title: intl.formatMessage(messages.fieldConditionMultiValuesTooltip),
        }}
        small={true}
      />
    );
  }

  generateTagSelectComparisonField(options: Array<{ label: string; value: string }>) {
    const { intl, name, idToAttachDropDowns, fieldValidators } = this.props;

    let popUpProps = {};

    if (idToAttachDropDowns) {
      popUpProps = {
        getPopupContainer: (e: HTMLElement) => document.getElementById(idToAttachDropDowns)!,
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
          options,
          ...popUpProps,
        }}
        validate={[fieldValidators.isRequired]}
        helpToolTipProps={{
          title: intl.formatMessage(messages.fieldConditionMultiValuesTooltip),
        }}
        small={true}
      />
    );
  }

  generateBooleanComparisonField() {
    return this.generateTagSelectComparisonField([
      { value: 'true', label: 'true' },
      { value: 'false', label: 'false' },
    ]);
  }

  generateEnumComparisonField(buitinEnumerationType?: BuitinEnumerationType) {
    const { intl } = this.props;

    return <div>{intl.formatMessage(messages.fieldTypeNotSupported)}</div>;
  }

  generateNumericComparisonField() {
    const { intl, name, fieldValidators, idToAttachDropDowns, disabled } = this.props;

    let popUpProps = {};

    if (idToAttachDropDowns) {
      popUpProps = {
        getPopupContainer: (e: HTMLElement) => document.getElementById(idToAttachDropDowns)!,
      };
    }

    // TODO do multi rendering for equals and not equals, do simple input rendering for the rest
    return (
      <FormMultiTagField
        name={name ? `${name}.comparison.values` : 'comparison.values'}
        component={FormMultiTag}
        validate={[fieldValidators.isRequired, fieldValidators.isValidArrayOfNumber]}
        formItemProps={{
          label: intl.formatMessage(messages.fieldConditionValuesNumberLabel),
          required: true,
        }}
        selectProps={{
          options: [],
          dropdownStyle: { display: 'none' },
          disabled: disabled,
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
      datamartId,
      idToAttachDropDowns,
      fieldValidators,
    } = this.props;

    const fetchListMethod = (keywords: string) =>
      this._audienceSegmentService
        .getSegments(organisationId, { keywords, datamart_id: datamartId })
        .then(res =>
          res.data.map(r => ({
            key: r.id,
            label: <SegmentNameDisplay audienceSegmentResource={r} />,
            value: r.id,
          })),
        );
    const fetchSingleMethod = (id: string) =>
      this._audienceSegmentService.getSegment(id).then(res => ({
        key: res.data.id,
        label: <SegmentNameDisplay audienceSegmentResource={res.data} />,
        value: res.data.id,
      }));

    let popUpProps = {};

    if (idToAttachDropDowns) {
      popUpProps = {
        getPopupContainer: (e: HTMLElement) => document.getElementById(idToAttachDropDowns)!,
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
        validate={[fieldValidators.isRequired]}
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

  generateReferenceTableComparisonField(type: string, modelType?: string) {
    const {
      intl,
      name,
      objectType,
      idToAttachDropDowns,
      datamartId,
      runtimeSchemaId,
      formValues,
      expressionIndex,
      fieldValidators,
      disabled,
      match: {
        params: { organisationId },
      },
      workspace: { community_id },
    } = this.props;

    const field = this.getField(formValues, expressionIndex);

    let fetchListMethod = (
      keywords: string,
    ): Promise<Array<{ key: string; label: JSX.Element | string; value: string }>> => {
      if (field) {
        return this._referenceTableService
          .getReferenceTable(datamartId, runtimeSchemaId, objectType.name, field.field)
          .then(res =>
            res.data.map(r => ({ key: r.value, label: r.display_value, value: r.value })),
          );
      }
      return Promise.resolve([]);
    };

    let fetchSingleMethod = (id: string) => Promise.resolve({ key: id, label: id, value: id });
    let selectProps = {};
    let loadOnlyOnce = false;
    let shouldFilterData = false;

    if (type && type === 'CORE_OBJECT') {
      if (modelType) {
        switch (modelType) {
          case 'COMPARTMENTS':
            fetchListMethod = (keywords: string) => {
              return this._datamartService
                .getUserAccountCompartmentDatamartSelectionResources(datamartId)
                .then(res =>
                  res.data.map(r => ({
                    key: r.compartment_id,
                    label: r.name ? r.name : r.token,
                    value: r.compartment_id,
                  })),
                );
            };
            fetchSingleMethod = (id: string) =>
              this._compartmentService
                .getCompartment(id)
                .then(res => ({ key: res.data.id, label: res.data.name, value: res.data.id }));
            break;
          case 'CHANNELS':
            fetchListMethod = (keywords: string) => {
              return this._channelService
                .getChannelsByOrganisation(organisationId, {
                  community_id: organisationId === community_id ? community_id : undefined,
                  keywords: keywords,
                  with_source_datamarts: true,
                })
                .then(res => res.data.map(r => ({ key: r.id, label: r.name, value: r.id })));
            };
            fetchSingleMethod = (id: string) =>
              this._channelService
                .getChannel(datamartId, id)
                .then(res => ({ key: res.data.id, label: res.data.name, value: res.data.id }));
            break;
          case 'SEGMENTS':
            fetchListMethod = (keywords: string) => {
              return this._audienceSegmentService
                .getSegments(organisationId, {
                  keywords: keywords,
                  datamart_id: datamartId,
                })
                .then(res =>
                  res.data.map(r => ({
                    key: r.id,
                    label: <SegmentNameDisplay audienceSegmentResource={r} />,
                    value: r.id,
                  })),
                );
            };
            fetchSingleMethod = (id: string) =>
              this._audienceSegmentService
                .getSegment(id)
                .then(res => ({ key: res.data.id, label: res.data.name, value: res.data.id }));
            break;
        }
      }
    } else if (type && type === 'COMPUTED') {
      fetchListMethod = (keywords: string) =>
        this.fetchPredicates(this._computedTreeNodePath, field ? field.field : '').then(r =>
          r.map(e => ({ key: e, label: e, value: e })),
        );
      selectProps = {
        ...selectProps,
        mode: 'tags',
      };
      shouldFilterData = true;
      loadOnlyOnce = true;
    }

    if (idToAttachDropDowns) {
      selectProps = {
        ...selectProps,
        getPopupContainer: (e: HTMLElement) => document.getElementById(idToAttachDropDowns)!,
      };
    }

    return (
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
        validate={[fieldValidators.isRequired]}
        selectProps={{
          ...selectProps,
          disabled: disabled,
        }}
        type={field && field.field}
        small={true}
        loadOnlyOnce={loadOnlyOnce}
        shouldFilterData={shouldFilterData}
      />
    );
  }

  getFieldDirective = (fieldName: string) => {
    const { objectType } = this.props;
    const foundField = objectType.fields.find(f => f.name === fieldName);
    return foundField ? foundField.directives : undefined;
  };

  render() {
    const {
      expressionIndex,
      fieldValidators: { isRequired },
      intl,
      formValues,
      name,
      idToAttachDropDowns,
      disabled,
      isEdge,
    } = this.props;

    const field = this.getField(formValues, expressionIndex);
    const directive = field ? this.getFieldDirective(field.field) : undefined;
    const hasSelectedAField = field && field.field !== '';
    const fieldName = field ? field.field : '';
    const fieldCondition =
      field && field.comparison && field.comparison.operator
        ? (field.comparison.operator as ConditionsOperators)
        : undefined;
    const fieldType = this.getSelectedFieldType(fieldName);
    const fieldIndexDataType = this.getSelectedFieldIndexDataType(fieldName);

    let popUpProps = {};

    if (idToAttachDropDowns) {
      popUpProps = {
        getPopupContainer: (e: HTMLElement) => document.getElementById(idToAttachDropDowns)!,
      };
    }

    const generatedAvailableConditionOptions = this.generateAvailableConditionOptions(
      fieldType,
      fieldIndexDataType,
      directive,
      isEdge,
    );

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
            disabled,
            className: 'mcs-fieldNodeForm_select',
          }}
          disabled={disabled}
          small={true}
        />
        <FormSelectField
          name={name ? `${name}.comparison.operator` : 'comparison.operator'}
          component={DefaultSelect}
          validate={[]}
          options={generatedAvailableConditionOptions.values}
          formItemProps={{
            label: intl.formatMessage(messages.fieldConditionConditionLabel),
          }}
          selectProps={{
            notFoundContent: intl.formatMessage(messages.fieldTypeNotSupported),
            ...popUpProps,
            disabled,
          }}
          small={true}
          disabled={!hasSelectedAField || disabled}
        />
        {fieldName && fieldCondition && generatedAvailableConditionOptions.component}
      </div>
    );
  }
}

const mapStateToProps = (state: MicsReduxState, ownProps: FieldNodeFormProps) => ({
  formValues: getFormValues(ownProps.formName || FORM_ID)(state),
});

export default compose<Props, FieldNodeFormProps>(
  withRouter,
  injectIntl,
  injectWorkspace,
  withValidators,
  withNormalizer,
  connect(mapStateToProps),
)(FieldNodeForm);

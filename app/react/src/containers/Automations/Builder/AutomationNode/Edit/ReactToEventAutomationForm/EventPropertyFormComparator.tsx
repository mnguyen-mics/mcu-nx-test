import React from 'react';
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import {
  DefaultSelect,
  FormMultiTagField,
  FormSelectField,
  TagSelect,
  withValidators,
} from '../../../../../../components/Form';
import {
  BuitinEnumerationType,
  FieldDirectiveInfoResource,
  FieldDirectiveResource,
  ObjectLikeTypeInfoResource,
} from '../../../../../../models/datamart/graphdb/RuntimeSchema';
import constants, {
  builtinEnumTypeOptions,
  ComparisonValues,
} from '../../../../../QueryTool/JSONOTQL/Edit/Sections/Field/contants';
import {
  FieldProposalLookup,
  getCoreReferenceTypeAndModel,
} from '../../../../../QueryTool/JSONOTQL/domain';
import {
  FormRelativeAbsoluteDateField,
  FormSearchObjectField,
  FormTagSelectField,
} from '../../../../../QueryTool/JSONOTQL/Edit/Sections/Field/FieldNodeForm';
import FormRelativeAbsoluteDate from '../../../../../QueryTool/JSONOTQL/Edit/Sections/Field/Comparison/FormRelativeAbsoluteDate';
import FormMultiTag from '../../../../../../components/Form/FormSelect/FormMultiTag';
import { SegmentNameDisplay } from '../../../../../Audience/Common/SegmentNameDisplay';
import FormSearchObject from '../../../../../../components/Form/FormSelect/FormSearchObject';
import { lazyInject } from '../../../../../../config/inversify.config';
import { TYPES } from '../../../../../../constants/types';
import { IAudienceSegmentService } from '../../../../../../services/AudienceSegmentService';
import { IComparmentService } from '../../../../../../services/CompartmentService';
import { IChannelService } from '../../../../../../services/ChannelService';
import { IDatamartService } from '../../../../../../services/DatamartService';
import { IReferenceTableService } from '../../../../../../services/ReferenceTableService';
import { ValidatorProps } from '../../../../../../components/Form/withValidators';
import { RouteComponentProps, withRouter } from 'react-router';
import { InjectedWorkspaceProps, injectWorkspace } from '../../../../../Datamart';
import { FieldNode } from '../../../../../../models/datamart/graphdb/QueryDocument';

type FieldComparisonGenerator = ComparisonValues<any> & {
  component: React.ReactNode;
  fetchPredicate?: Promise<{ value: string; name: string; disabled: boolean }>;
};

export type EventPropertyFormComparatorProps = {
  name?: string;
  disabled?: boolean;
  fieldType?: string;
  fieldIndexDataType?: string;
  fieldNode?: FieldNode;
  objectType: ObjectLikeTypeInfoResource;
  directives?: FieldDirectiveInfoResource[];
  isEdge?: boolean;
  idToAttachDropDowns?: string;
  datamartId: string;
  runtimeSchemaId: string;
  runFieldProposal?: FieldProposalLookup;
  formChange: (fieldName: string, value: any) => void;
};

type Props = EventPropertyFormComparatorProps &
  InjectedIntlProps &
  ValidatorProps &
  InjectedWorkspaceProps &
  RouteComponentProps<{ organisationId: string }>;

type State = {};
class EventPropertyFormComparator extends React.Component<Props, State> {
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

  componentDidUpdate(previousProps: Props) {
    const {
      name,
      fieldType,
      fieldIndexDataType,
      isEdge,
      directives: directive,
      formChange,
      fieldNode,
    } = this.props;

    const { fieldNode: previousFieldNode } = previousProps;

    if (fieldType && fieldNode && fieldNode.field !== previousFieldNode?.field) {
      formChange(
        name ? `${name}.comparison` : 'comparison',
        this.generateAvailableConditionOptions(fieldType, fieldIndexDataType, directive, isEdge)
          .defaultValue,
      );
    }
  }

  generateAvailableConditionOptions = (
    fieldType?: string,
    fieldIndexDataType?: string,
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
    const { intl, name, disabled, idToAttachDropDowns, fieldNode } = this.props;

    let popUpProps = {};

    if (idToAttachDropDowns) {
      popUpProps = {
        getCalendarContainer: (e: HTMLElement) => document.getElementById(idToAttachDropDowns)!,
      };
    }

    const comparisonOperatorValue = fieldNode?.comparison?.operator;

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
      fieldNode,
      fieldValidators,
      disabled,
      match: {
        params: { organisationId },
      },
      workspace: { community_id },
    } = this.props;

    let fetchListMethod = (
      keywords: string,
    ): Promise<Array<{ key: string; label: JSX.Element | string; value: string }>> => {
      if (fieldNode) {
        return this._referenceTableService
          .getReferenceTable(datamartId, runtimeSchemaId, objectType.name, fieldNode.field)
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
        this.fetchPredicates(this._computedTreeNodePath, fieldNode ? fieldNode.field : '').then(r =>
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
        type={fieldNode && fieldNode.field}
        small={true}
        loadOnlyOnce={loadOnlyOnce}
        shouldFilterData={shouldFilterData}
      />
    );
  }

  fetchPredicates = (treeNodePath: number[], fieldName: string) => {
    const { runFieldProposal } = this.props;
    if (!runFieldProposal) {
      return Promise.resolve([]);
    }

    return runFieldProposal(treeNodePath, fieldName);
  };

  render() {
    const { name, intl, disabled, fieldIndexDataType, directives, isEdge, fieldType } = this.props;

    const generatedAvailableConditionOptions = this.generateAvailableConditionOptions(
      fieldType,
      fieldIndexDataType,
      directives,
      isEdge,
    );

    return (
      <div>
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
            disabled,
          }}
          small={true}
          disabled={!generatedAvailableConditionOptions.component || disabled}
        />
        {generatedAvailableConditionOptions.component}
      </div>
    );
  }
}

export default compose<Props, EventPropertyFormComparatorProps>(
  injectIntl,
  withRouter,
  injectWorkspace,
  withValidators,
)(EventPropertyFormComparator);

const messages = defineMessages({
  fieldConditionTitle: {
    id: 'eventPropertyFormComparator.fieldCondition.title',
    defaultMessage: 'Field Conditions',
  },
  fieldConditionSubTitle: {
    id: 'eventPropertyFormComparator.fieldCondition.subtitle',
    defaultMessage: 'Add Field Conditions to the selected object',
  },
  fieldConditionFieldLabel: {
    id: 'eventPropertyFormComparator.fieldCondition.field.label',
    defaultMessage: 'Field Name',
  },
  fieldConditionConditionLabel: {
    id: 'eventPropertyFormComparator.fieldCondition.condition.label',
    defaultMessage: 'Condition',
  },
  fieldConditionValuesLabel: {
    id: 'eventPropertyFormComparator.fieldCondition.values.label',
    defaultMessage: 'Field Values',
  },
  fieldConditionValuesNumberLabel: {
    id: 'eventPropertyFormComparator.fieldCondition.valuesNumbers.label',
    defaultMessage: 'Field Values (Numbers Only)',
  },
  fieldConditionValuesStringLabel: {
    id: 'eventPropertyFormComparator.fieldCondition.valuesString.label',
    defaultMessage: 'Field Values (Strings)',
  },
  fieldConditionMultiValuesTooltip: {
    id: 'eventPropertyFormComparator.fieldCondition.multivalues.tooltip',
    defaultMessage: 'The query will be evaluated to match at least one of the values.',
  },
  fieldConditionValuesTooltip: {
    id: 'eventPropertyFormComparator.fieldCondition.values.tooltip',
    defaultMessage: 'The query will be evaluated to match your value.',
  },
  fieldConditionBooleanOperatorTitle: {
    id: 'eventPropertyFormComparator.fieldCondition.booleanOperator.title',
    defaultMessage: 'Operator',
  },
  fieldTypeNotSupported: {
    id: 'eventPropertyFormComparator.fieldCondition.fieldTypeNotSupported.title',
    defaultMessage: 'Field Type Not Supported',
  },
  EQ: {
    id: 'eventPropertyFormComparator.fieldCondition.condition.EQ',
    defaultMessage: 'Equals',
  },
  NOT_EQ: {
    id: 'eventPropertyFormComparator.fieldCondition.condition.NOT_EQ',
    defaultMessage: 'Does Not Equal',
  },
  MATCHES: {
    id: 'eventPropertyFormComparator.fieldCondition.condition.MATCHES',
    defaultMessage: 'Matches',
  },
  DOES_NOT_MATCH: {
    id: 'eventPropertyFormComparator.fieldCondition.condition.DOES_NOT_MATCH',
    defaultMessage: 'Does Not Match',
  },
  STARTS_WITH: {
    id: 'eventPropertyFormComparator.fieldCondition.condition.STARTS_WITH',
    defaultMessage: 'Starts With',
  },
  DOES_NOT_START_WITH: {
    id: 'eventPropertyFormComparator.fieldCondition.condition.DOES_NOT_START_WITH',
    defaultMessage: 'Does Not Start With',
  },
  CONTAINS: {
    id: 'eventPropertyFormComparator.fieldCondition.condition.CONTAINS',
    defaultMessage: 'Contains',
  },
  DOES_NOT_CONTAIN: {
    id: 'eventPropertyFormComparator.fieldCondition.condition.DOES_NOT_CONTAIN',
    defaultMessage: 'Does Not Contain',
  },
  BEFORE: {
    id: 'eventPropertyFormComparator.fieldCondition.condition.BEFORE',
    defaultMessage: 'Before',
  },
  BEFORE_OR_EQUAL: {
    id: 'eventPropertyFormComparator.fieldCondition.condition.BEFORE_OR_EQUAL',
    defaultMessage: 'Before Or Equal',
  },
  AFTER: {
    id: 'eventPropertyFormComparator.fieldCondition.condition.AFTER',
    defaultMessage: 'After',
  },
  AFTER_OR_EQUAL: {
    id: 'eventPropertyFormComparator.fieldCondition.condition.AFTER_OR_EQUAL',
    defaultMessage: 'After Or Equal',
  },
  EQUAL: {
    id: 'eventPropertyFormComparator.fieldCondition.condition.EQUAL',
    defaultMessage: 'Equals',
  },
  NOT_EQUAL: {
    id: 'eventPropertyFormComparator.fieldCondition.condition.NOT_EQUAL',
    defaultMessage: 'Does Not Equal',
  },
  LT: {
    id: 'eventPropertyFormComparator.fieldCondition.condition.LT',
    defaultMessage: 'Is Less Than',
  },
  LTE: {
    id: 'eventPropertyFormComparator.fieldCondition.condition.LTE',
    defaultMessage: 'Is Less Than Or Equals To',
  },
  GT: {
    id: 'eventPropertyFormComparator.fieldCondition.condition.GT',
    defaultMessage: 'Is Greater Than',
  },
  GTE: {
    id: 'eventPropertyFormComparator.fieldCondition.condition.GTE',
    defaultMessage: 'Is Greater Than Or Equals',
  },
});

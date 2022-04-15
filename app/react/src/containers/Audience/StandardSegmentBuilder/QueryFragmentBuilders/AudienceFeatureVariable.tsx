import * as React from 'react';
import _ from 'lodash';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import {
  withValidators,
  FormMultiTagField,
  FormSelectField,
  DefaultSelect,
  FormInputNumberField,
  FormInputNumber,
} from '../../../../components/Form';
import { ValidatorProps } from '../../../../components/Form/withValidators';
import FormMultiTag from '../../../../components/Form/FormSelect/FormMultiTag';
import { Field, GenericField, unregisterField } from 'redux-form';
import FormRelativeAbsoluteDate, {
  FormRelativeAbsoluteDateProps,
} from '../../AdvancedSegmentBuilder/Edit/Sections/Field/Comparison/FormRelativeAbsoluteDate';
import { builtinEnumTypeOptions } from '../../AdvancedSegmentBuilder/Edit/Sections/Field/contants';
import { IQueryService } from '../../../../services/QueryService';
import { AudienceFeatureVariableResource } from '../../../../models/audienceFeature';
import { ObjectLikeTypeInfoResource } from '../../../../models/datamart/graphdb/RuntimeSchema';
import { getCoreReferenceTypeAndModel } from '../../AdvancedSegmentBuilder/domain';
import FormSearchObject, {
  FormSearchObjectProps,
} from '../../../../components/Form/FormSelect/FormSearchObject';
import FormSearchObjectList, {
  FormSearchObjectListProps,
} from '../../../../components/Form/FormSelect/FormSearchObjectList';
import FormSearchMatch, {
  FormSearchMatchProps,
} from '../../../../components/Form/FormSelect/FormSearchMatch';
import FormSearchSingleValue, {
  FormSearchSingleValueProps,
} from '../../../../components/Form/FormSelect/FormSearchSingleValue';
import { IReferenceTableService } from '../../../../services/ReferenceTableService';
import { IDatamartService } from '../../../../services/DatamartService';
import { IComparmentService } from '../../../../services/CompartmentService';
import { IChannelService } from '../../../../services/ChannelService';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectWorkspace, InjectedWorkspaceProps } from '../../../Datamart';
import { IAudienceSegmentService } from '../../../../services/AudienceSegmentService';
import { SegmentNameDisplay } from '../../Common/SegmentNameDisplay';
import { FORM_ID } from '../constants';
import { Tooltip } from 'antd';
import { truncate } from './AudienceFeatureSelectionTag';

export const FormRelativeAbsoluteDateField =
  Field as new () => GenericField<FormRelativeAbsoluteDateProps>;

export const FormSearchObjectField = Field as new () => GenericField<FormSearchObjectProps>;

export const FormSearchObjectListField = Field as new () => GenericField<FormSearchObjectListProps>;

export const FormSearchMatchField = Field as new () => GenericField<FormSearchMatchProps>;

export const FormSearchSingleStringField =
  Field as new () => GenericField<FormSearchSingleValueProps>;

export interface AudienceFeatureVariableProps {
  datamartId: string;
  variable: AudienceFeatureVariableResource;
  formPath: string;
  objectTypes: ObjectLikeTypeInfoResource[];
  disabled?: boolean;
  formChange?(field: string, value: any): void;
}

type Props = AudienceFeatureVariableProps &
  InjectedIntlProps &
  InjectedWorkspaceProps &
  ValidatorProps &
  RouteComponentProps<{ organisationId: string }>;

class AudienceFeatureVariable extends React.Component<Props> {
  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  @lazyInject(TYPES.IReferenceTableService)
  private _referenceTableService: IReferenceTableService;

  @lazyInject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;

  @lazyInject(TYPES.ICompartmentService)
  private _compartmentService: IComparmentService;

  @lazyInject(TYPES.IChannelService)
  private _channelService: IChannelService;

  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  // The singleStringValue will make FormSearchObjectField component handle only one string value
  // The matchValue will make FormSearchObjectField component handle multiple values grouped in one string
  // (example: "val1 val2 val3" see 'JSONOTQL data_type=text' specs for details)
  // If both are false, the component will handle multiple string values grouped in one array (default behaviour)
  renderSelectField = (singleStringValue: boolean, matchValue: boolean) => {
    const {
      variable,
      formPath,
      datamartId,
      objectTypes,
      match: {
        params: { organisationId },
      },
      workspace: { community_id },
      disabled,
      formChange,
    } = this.props;
    const name = `${formPath}.parameters.${variable.parameter_name}`;

    const fieldGridConfig = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };

    const userPointObject = objectTypes.find(o => o.name === 'UserPoint')!;
    const foundField =
      userPointObject && userPointObject.fields.find(f => f.name === variable.path[0]);
    const schemaType = foundField
      ? objectTypes.find(ot => foundField.field_type.includes(ot.name))
      : undefined;
    const field = schemaType?.fields.find(f => f.name === variable.field_name);
    const fieldDirectives = field ? field.directives : undefined;
    let selectProps = {};
    let loadOnlyOnce = false;
    let shouldFilterData = false;

    let fetchListMethod = (
      keywords: string,
    ): Promise<Array<{ key: string; label: JSX.Element | string; value: string }>> => {
      if (variable.field_name && foundField) {
        return this._referenceTableService
          .getReferenceTable(
            datamartId,
            foundField.runtime_schema_id,
            foundField.name,
            variable.field_name,
          )
          .then(res =>
            res.data.map(r => ({
              key: r.value,
              label: r.display_value,
              value: r.value,
            })),
          );
      }
      return Promise.resolve([]);
    };

    let fetchSingleMethod = (id: string) => Promise.resolve({ key: id, label: id, value: id });

    const modelAndType = fieldDirectives && getCoreReferenceTypeAndModel(fieldDirectives);

    if (fieldDirectives && modelAndType) {
      if (modelAndType.type && modelAndType.type === 'CORE_OBJECT') {
        switch (modelAndType.modelType) {
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
              this._compartmentService.getCompartment(id).then(res => ({
                key: res.data.id,
                label: res.data.name,
                value: res.data.id,
              }));
            break;
          case 'CHANNELS':
            fetchListMethod = (keywords: string) => {
              return this._channelService
                .getChannelsByOrganisation(organisationId, {
                  community_id: organisationId === community_id ? community_id : undefined,
                  keywords: keywords,
                  with_source_datamarts: true,
                })
                .then(res =>
                  res.data.map(r => ({
                    key: r.id,
                    label: r.name,
                    value: r.id,
                  })),
                );
            };
            fetchSingleMethod = (id: string) =>
              this._channelService.getChannel(datamartId, id).then(res => ({
                key: res.data.id,
                label: res.data.name,
                value: res.data.id,
              }));
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
              this._audienceSegmentService.getSegment(id).then(res => ({
                key: res.data.id,
                label: res.data.name,
                value: res.data.id,
              }));
            break;
        }
      }
    } else {
      fetchListMethod = (k: string) => {
        const queryStart = 'SELECT';
        const buildQuery = () => (acc: string, pathValue: string, index: number) => {
          const qq = `{ ${pathValue} ${acc} }`;
          return qq;
        };

        const path = variable.path.slice().reverse();

        const innerQuery = path.reduce(buildQuery(), '@map(limit:10000)');

        const query = `${queryStart} ${innerQuery} FROM UserPoint`;
        return this._queryService
          .runOTQLQuery(datamartId, query, {
            use_cache: true,
          })
          .then(otqlResultResp => {
            return otqlResultResp.data.rows[0].aggregations.buckets[0].buckets.map((b: any) => {
              return {
                key: b.key,
                label: b.key,
              };
            });
          });
      };
      selectProps = {
        ...selectProps,
        mode: 'tags',
        disabled: !!disabled,
      };
      loadOnlyOnce = true;
      shouldFilterData = true;
    }

    const formProps = {
      name: name,
      formItemProps: {
        label: (
          <Tooltip title={variable.parameter_name}>{truncate(18, variable.parameter_name)}</Tooltip>
        ),

        ...fieldGridConfig,
      },
      fetchListMethod: fetchListMethod,
      fetchSingleMethod: fetchSingleMethod,
      selectProps: selectProps,
      loadOnlyOnce: loadOnlyOnce,
      shouldFilterData: shouldFilterData,
    };

    if (singleStringValue && formChange) {
      const handleSingleValue = (value: any) => {
        formChange(name, value);
      };
      const handleNoValue = (inputName: string) => {
        unregisterField(FORM_ID, inputName);
        formChange(name, '');
      };
      return (
        <FormSearchSingleStringField
          component={FormSearchSingleValue}
          handleSingleValue={handleSingleValue}
          handleNoValue={handleNoValue}
          {...formProps}
        />
      );
    } else if (matchValue && formChange) {
      const handleMatchValue = (value: any) => {
        formChange(name, value);
      };
      return (
        <FormSearchMatchField
          component={FormSearchMatch}
          separator={' '}
          handleMatchValue={handleMatchValue}
          {...formProps}
        />
      );
    } else if (variable.container_type === 'List' && formChange) {
      const handleNoValue = (inputName: string) => {
        unregisterField(FORM_ID, inputName);
        formChange(name, '');
      };
      return (
        <FormSearchObjectListField
          type={variable.type?.toString()}
          component={FormSearchObjectList}
          handleNoValue={handleNoValue}
          {...formProps}
        />
      );
    } else {
      return (
        <FormSearchObjectField
          name={name}
          component={FormSearchObject}
          formItemProps={{
            label: (
              <Tooltip title={variable.parameter_name}>
                {truncate(18, variable.parameter_name)}
              </Tooltip>
            ),
            ...fieldGridConfig,
          }}
          fetchListMethod={fetchListMethod}
          fetchSingleMethod={fetchSingleMethod}
          selectProps={selectProps}
          loadOnlyOnce={loadOnlyOnce}
          shouldFilterData={shouldFilterData}
        />
      );
    }
  };

  renderField = () => {
    const {
      variable,
      formPath,
      fieldValidators: { isValidFloat, isValidInteger },
      disabled,
      formChange,
    } = this.props;
    const name = `${formPath}.parameters.${variable.parameter_name}`;

    const fieldGridConfig = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };

    const normalizeInt = (v: any): any => {
      return parseInt(v, 0) || v;
    };

    const normalizeFloat = (v: any): any => {
      return parseFloat(v) || v;
    };

    if (variable.container_type && variable.container_type.includes('List')) {
      return this.renderSelectField(false, false);
    } else if (variable.data_type && variable.data_type.includes('text')) {
      return this.renderSelectField(false, true);
    } else {
      switch (variable.type) {
        case 'Boolean':
          return (
            <FormSelectField
              small={true}
              name={name}
              component={DefaultSelect}
              formItemProps={{
                label: (
                  <Tooltip title={variable.parameter_name}>
                    {truncate(18, variable.parameter_name)}
                  </Tooltip>
                ),
                ...fieldGridConfig,
              }}
              disabled={!!disabled}
              options={[
                {
                  title: 'true',
                  value: 'true',
                },
                {
                  title: 'false',
                  value: 'false',
                },
              ]}
            />
          );
        case 'Int':
          return (
            <FormInputNumberField
              small={true}
              name={name}
              // Needed normalize hack to save as int in redux state
              normalize={normalizeInt}
              component={FormInputNumber}
              validate={[isValidInteger]}
              formItemProps={{
                label: (
                  <Tooltip title={variable.parameter_name}>
                    {truncate(18, variable.parameter_name)}
                  </Tooltip>
                ),
                ...fieldGridConfig,
              }}
              inputNumberProps={{
                disabled: !!disabled,
              }}
            />
          );

        case 'Float':
          return (
            <FormInputNumberField
              small={true}
              name={name}
              // Needed normalize hack to save as float in redux state
              normalize={normalizeFloat}
              component={FormInputNumber}
              validate={[isValidFloat]}
              formItemProps={{
                label: (
                  <Tooltip title={variable.parameter_name}>
                    {truncate(18, variable.parameter_name)}
                  </Tooltip>
                ),
                ...fieldGridConfig,
              }}
              inputNumberProps={{
                disabled: !!disabled,
              }}
            />
          );

        case 'String':
        case 'ID':
          return this.renderSelectField(true, false);
        case 'Timestamp':
        case 'Date':
          let handleStringValue;
          if (formChange) {
            handleStringValue = (value: any) => {
              formChange(name, value);
            };
          }
          return (
            <FormRelativeAbsoluteDateField
              small={true}
              name={name}
              component={FormRelativeAbsoluteDate}
              formItemProps={{
                label: (
                  <Tooltip title={variable.parameter_name}>
                    {truncate(18, variable.parameter_name)}
                  </Tooltip>
                ),
                ...fieldGridConfig,
              }}
              unixTimstamp={true}
              disabled={!!disabled}
              noListValue={true}
              handleStringValue={handleStringValue}
            />
          );
        case 'OperatingSystemFamily':
        case 'FormFactor':
        case 'HashFunction':
        case 'BrowserFamily':
        case 'UserAgentType':
        case 'ActivitySource':
        case 'UserActivityType':
          return (
            <FormMultiTagField
              small={true}
              name={name}
              component={FormMultiTag}
              selectProps={{
                options: (builtinEnumTypeOptions[variable.type] as string[]).map(t => {
                  return {
                    label: t,
                    value: t,
                  };
                }),
                disabled: !!disabled,
              }}
              formItemProps={{
                label: (
                  <Tooltip title={variable.parameter_name}>
                    {truncate(18, variable.parameter_name)}
                  </Tooltip>
                ),
                ...fieldGridConfig,
              }}
            />
          );

        default:
          return 'not supported';
      }
    }
  };

  render() {
    return (
      <div className={'mcs-standardSegmentBuilder_audienceFeatureInput'}>{this.renderField()}</div>
    );
  }
}

export default compose<Props, AudienceFeatureVariableProps>(
  injectIntl,
  withValidators,
  withRouter,
  injectWorkspace,
)(AudienceFeatureVariable);

import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import {
  withValidators,
  FormMultiTagField,
  FormSelectField,
  DefaultSelect,
  FormInputField,
  FormInput,
} from '../../../../components/Form';
import { ValidatorProps } from '../../../../components/Form/withValidators';
import FormMultiTag from '../../../../components/Form/FormSelect/FormMultiTag';
import { Field, GenericField } from 'redux-form';
import FormRelativeAbsoluteDate, {
  FormRelativeAbsoluteDateProps,
} from '../../../QueryTool/JSONOTQL/Edit/Sections/Field/Comparison/FormRelativeAbsoluteDate';
import { builtinEnumTypeOptions } from '../../../QueryTool/JSONOTQL/Edit/Sections/Field/contants';
import { IQueryService } from '../../../../services/QueryService';
import { AudienceFeatureVariableResource } from '../../../../models/audienceFeature';
import { ObjectLikeTypeInfoResource } from '../../../../models/datamart/graphdb/RuntimeSchema';
import { getCoreReferenceTypeAndModel } from '../../../QueryTool/JSONOTQL/domain';
import FormSearchObject, {
  FormSearchObjectProps,
} from '../../../../components/Form/FormSelect/FormSearchObject';
import { IReferenceTableService } from '../../../../services/ReferenceTableService';
import { IDatamartService } from '../../../../services/DatamartService';
import { IComparmentService } from '../../../../services/CompartmentService';
import { IChannelService } from '../../../../services/ChannelService';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectWorkspace, InjectedWorkspaceProps } from '../../../Datamart';
import { IAudienceSegmentService } from '../../../../services/AudienceSegmentService';
import SegmentNameDisplay from '../../Common/SegmentNameDisplay';

export const FormRelativeAbsoluteDateField = Field as new () => GenericField<
  FormRelativeAbsoluteDateProps
>;

export const FormSearchObjectField = Field as new () => GenericField<
  FormSearchObjectProps
>;

export interface AudienceFeatureVariableProps {
  datamartId: string;
  variable: AudienceFeatureVariableResource;
  formPath: string;
  objectTypes: ObjectLikeTypeInfoResource[];
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

  renderField = () => {
    const {
      variable,
      formPath,
      datamartId,
      objectTypes,
      match: {
        params: { organisationId },
      },
      workspace: { community_id },
    } = this.props;
    let name;
    name = `${formPath}.parameters.${variable.parameter_name}`;
    const fieldGridConfig = {
      labelCol: { span: 3 },
      wrapperCol: { span: 20, offset: 1 },
    };

    switch (variable.type) {
      case 'Enum':
        return (
          <FormMultiTagField
            name={name}
            component={FormMultiTag}
            formItemProps={{
              label: variable.parameter_name,
              ...fieldGridConfig,
            }}
            selectProps={{
              options: [],
            }}
          />
        );
      case 'Boolean':
        return (
          <FormSelectField
            name={name}
            component={DefaultSelect}
            formItemProps={{
              label: variable.parameter_name,
              ...fieldGridConfig,
            }}
          />
        );
      case 'Int':
        return (
          <FormInputField
            name={name}
            component={FormInput}
            formItemProps={{
              label: variable.parameter_name,
              ...fieldGridConfig,
            }}
          />
        );
      case 'String':
        const userPointObject = objectTypes.find(o => o.name === 'UserPoint')!;
        const foundField = userPointObject.fields.find(
          f => f.name === variable.field_name,
        );
        const fieldDirectives = foundField ? foundField.directives : undefined;
        let fetchListMethod = (
          keywords: string,
        ): Promise<Array<{ key: string; label: JSX.Element | string }>> => {
          if (variable.field_name && foundField) {
            return this._referenceTableService
              .getReferenceTable(
                datamartId,
                foundField.runtime_schema_id,
                userPointObject.name,
                variable.field_name,
              )
              .then(res =>
                res.data.map(r => ({ key: r.value, label: r.display_value })),
              );
          }
          return Promise.resolve([]);
        };
        let fetchSingleMethod = (id: string) =>
          Promise.resolve({ key: id, label: id });

        if (fieldDirectives) {
          const modelAndType = getCoreReferenceTypeAndModel(fieldDirectives);
          if (modelAndType) {
            if (modelAndType.type && modelAndType.type === 'CORE_OBJECT') {
              switch (modelAndType.modelType) {
                case 'COMPARTMENTS':
                  fetchListMethod = (keywords: string) => {
                    return this._datamartService
                      .getUserAccountCompartmentDatamartSelectionResources(
                        datamartId,
                      )
                      .then(res =>
                        res.data.map(r => ({
                          key: r.compartment_id,
                          label: r.name ? r.name : r.token,
                        })),
                      );
                  };
                  fetchSingleMethod = (id: string) =>
                    this._compartmentService.getCompartment(id).then(res => ({
                      key: res.data.id,
                      label: res.data.name,
                    }));
                  break;
                case 'CHANNELS':
                  fetchListMethod = (keywords: string) => {
                    return this._channelService
                      .getChannelsByOrganisation(organisationId, {
                        community_id:
                          organisationId === community_id
                            ? community_id
                            : undefined,
                        keywords: keywords,
                        with_source_datamarts: true,
                      })
                      .then(res =>
                        res.data.map(r => ({ key: r.id, label: r.name })),
                      );
                  };
                  fetchSingleMethod = (id: string) =>
                    this._channelService
                      .getChannel(datamartId, id)
                      .then(res => ({
                        key: res.data.id,
                        label: res.data.name,
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
                          label: (
                            <SegmentNameDisplay audienceSegmentResource={r} />
                          ),
                        })),
                      );
                  };
                  fetchSingleMethod = (id: string) =>
                    this._audienceSegmentService.getSegment(id).then(res => ({
                      key: res.data.id,
                      label: res.data.name,
                    }));
                  break;
              }
            }
          }
        } else {
          const queryStart = 'SELECT';
          const buildQuery = () => (
            acc: string,
            pathValue: string,
            index: number,
          ) => {
            const qq = `{ ${pathValue} ${acc} }`;
            return qq;
          };

          const path = variable.path;

          const innerQuery = path.reduce(buildQuery(), '@map(limit:10000)');

          const query = `${queryStart} ${innerQuery} FROM UserPoint`;
          fetchListMethod = (k: string) =>
            this._queryService
              .runOTQLQuery(datamartId, query, {
                use_cache: true,
              })
              .then(otqlResultResp => {
                return otqlResultResp.data.rows[0].aggregations.map(
                  (r: any) => {
                    return {
                      key: r,
                      label: r,
                    };
                  },
                );
              });
        }

        return (
          <FormSearchObjectField
            name={name}
            component={FormSearchObject}
            formItemProps={{
              label: variable.parameter_name,
              ...fieldGridConfig,
            }}
            fetchListMethod={fetchListMethod}
            fetchSingleMethod={fetchSingleMethod}
          />
        );
      case 'Timestamp':
      case 'Date':
        return (
          <FormRelativeAbsoluteDateField
            name={name}
            component={FormRelativeAbsoluteDate}
            formItemProps={{
              label: variable.parameter_name,
            }}
            unixTimstamp={true}
            noArrayValues={true}
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
            name={name}
            component={FormMultiTag}
            selectProps={{
              options: (builtinEnumTypeOptions[variable.type] as string[]).map(
                t => {
                  return {
                    label: t,
                    value: t,
                  };
                },
              ),
            }}
            formItemProps={{
              label: variable.parameter_name,
              labelCol: { span: 3 },
              wrapperCol: { span: 20, offset: 1 },
            }}
          />
        );

      default:
        return 'not supported';
    }
  };

  render() {
    return (
      <div className="mcs-segmentBuilder_audienceFeatureInput">
        {this.renderField()}
      </div>
    );
  }
}

export default compose<Props, AudienceFeatureVariableProps>(
  injectIntl,
  withValidators,
  withRouter,
  injectWorkspace,
)(AudienceFeatureVariable);

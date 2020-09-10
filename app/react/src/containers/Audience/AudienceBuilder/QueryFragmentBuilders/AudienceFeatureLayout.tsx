import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { AudienceFeatureResource } from '../../../../models/audienceFeature';
import { Spin } from 'antd';
import { lazyInject } from '../../../../config/inversify.config';
import { IAudienceFeatureService } from '../../../../services/AudienceFeatureService';
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
import { AudienceFeatureVariable } from '../../../../models/audienceFeature/AudienceFeatureResource';
import { AudienceBuilderParametricPredicateNode } from '../../../../models/audienceBuilder/AudienceBuilderResource';
import { Field, GenericField } from 'redux-form';
import FormRelativeAbsoluteDate, {
  FormRelativeAbsoluteDateProps,
} from '../../../QueryTool/JSONOTQL/Edit/Sections/Field/Comparison/FormRelativeAbsoluteDate';
import { builtinEnumTypeOptions } from '../../../QueryTool/JSONOTQL/Edit/Sections/Field/contants';

export const FormRelativeAbsoluteDateField = Field as new () => GenericField<
  FormRelativeAbsoluteDateProps
>;

interface State {
  audienceFeature?: AudienceFeatureResource;
}

export interface AudienceFeatureLayoutProps {
  datamartId: string;
  formPath: string;
  parametricPredicateResource: AudienceBuilderParametricPredicateNode;
}

type Props = AudienceFeatureLayoutProps & InjectedIntlProps & ValidatorProps;

class AudienceFeatureLayout extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceFeatureService)
  private _audienceFeatureService: IAudienceFeatureService;

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { datamartId, parametricPredicateResource } = this.props;
    this._audienceFeatureService
      .getAudienceFeature(datamartId, parametricPredicateResource.parametric_predicate_id)
      .then(res => {
        this.setState({
          audienceFeature: res.data,
        });
      });
  }

  renderField = (featureVariable: AudienceFeatureVariable) => {
    const { formPath } = this.props;
    let name;
    name = `${formPath}.parameters.${featureVariable.parameter_name}`;
    const fieldGridConfig = {
      labelCol: { span: 3 },
      wrapperCol: { span: 19, offset: 1 },
    };

    switch (featureVariable.type) {
      // To list Enum options, we will use here feature.path to build a query like this :
      // select { path[0] { path[1] @map(limit:10000) } } from UserPoint
      // or use feature.directives to do the call if they are provided
      case 'Enum':
        return (
          <FormMultiTagField
            name={name}
            component={FormMultiTag}
            formItemProps={{
              label: featureVariable.field_name,
              ...fieldGridConfig,
            }}
          />
        );
      case 'Boolean':
        return (
          <FormSelectField
            name={name}
            component={DefaultSelect}
            formItemProps={{
              label: featureVariable.field_name,
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
              label: featureVariable.field_name,
              ...fieldGridConfig,
            }}
          />
        );
      case 'String':
        return (
          <FormInputField
            name={name}
            component={FormInput}
            formItemProps={{
              label: featureVariable.field_name,
              ...fieldGridConfig,
            }}
          />
        );
      case 'Timestamp': 
      case 'Date':
        return (
          <FormRelativeAbsoluteDateField
            name={name}
            component={FormRelativeAbsoluteDate}
            formItemProps={{
              label: featureVariable.field_name,
            }}
            unixTimstamp={true}
          />
        );
      case 'OperatingSystemFamily':
      case 'FormFactor':
      case 'HashFunction':
      case 'BrowserFamily':
      case 'UserAgentType':
      case 'ActivitySource':
      case 'UserActivityType':
        return <FormMultiTagField
        name={name}
        component={FormMultiTag}
        selectProps={{
          options: (builtinEnumTypeOptions[featureVariable.type] as string[]).map(t => {
            return {
              label: t,
              value: t
            }
          })
        }}
        formItemProps={{
          label: featureVariable.field_name,
          labelCol: { span: 5 },
          wrapperCol: { span: 17, offset: 1 }, 
        }}
      />;
            
      default:
        return 'not supported';
    }
  };

  render() {
    const { audienceFeature } = this.state;

    return audienceFeature ? (
      <React.Fragment>
        <div className="mcs-segmentBuilder_audienceFeatureName">{`${audienceFeature.name}`}</div>
        <div className="mcs-segmentBuilder_audienceFeatureDescription">{`${audienceFeature.description} `}</div>
        {audienceFeature.variables.map((v, index) => {
          return (
            <div
              className="mcs-segmentBuilder_audienceFeatureInput"
              key={index}
            >
              {this.renderField(v)}
            </div>
          );
        })}
      </React.Fragment>
    ) : (
      <Spin />
    );
  }
}

export default compose<Props, AudienceFeatureLayoutProps>(
  injectIntl,
  withValidators,
)(AudienceFeatureLayout);

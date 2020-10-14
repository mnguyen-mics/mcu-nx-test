import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { AudienceFeatureResource } from '../../../../models/audienceFeature';
import { Spin } from 'antd';
import { lazyInject } from '../../../../config/inversify.config';
import { IAudienceFeatureService } from '../../../../services/AudienceFeatureService';
import { TYPES } from '../../../../constants/types';
import { withValidators } from '../../../../components/Form';
import { ValidatorProps } from '../../../../components/Form/withValidators';
import { AudienceBuilderParametricPredicateNode } from '../../../../models/audienceBuilder/AudienceBuilderResource';
import { Field, GenericField } from 'redux-form';
import { FormRelativeAbsoluteDateProps } from '../../../QueryTool/JSONOTQL/Edit/Sections/Field/Comparison/FormRelativeAbsoluteDate';
import AudienceFeatureVariable from './AudienceFeatureVariable';
import { ObjectLikeTypeInfoResource } from '../../../../models/datamart/graphdb/RuntimeSchema';

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
  objectTypes: ObjectLikeTypeInfoResource[];
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
      .getAudienceFeature(
        datamartId,
        parametricPredicateResource.parametric_predicate_id,
      )
      .then(res => {
        this.setState({
          audienceFeature: {
            ...res.data,
            variables: res.data.variables.map(v => {
              return {
                ...v,
                path: v.path.reverse(),
              };
            }),
          },
        });
      });
  }

  render() {
    const { audienceFeature } = this.state;

    const { datamartId, formPath, objectTypes } = this.props;

    return audienceFeature ? (
      <React.Fragment>
        <div className="mcs-audienceBuilder_audienceFeatureName">{`${audienceFeature.name}`}</div>
        <i className="mcs-audienceBuilder_audienceFeatureDescription">{`${audienceFeature.description} `}</i>
        {audienceFeature.variables.map((v, index) => {
          return (
            <AudienceFeatureVariable
              key={index}
              datamartId={datamartId}
              variable={v}
              formPath={formPath}
              objectTypes={objectTypes}
            />
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

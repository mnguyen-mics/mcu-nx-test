import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { AudienceFeatureResource } from '../../../../models/audienceFeature';
import { Spin } from 'antd';
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
  audienceFeatures?: AudienceFeatureResource[];
  formChange(field: string, value: any): void;
}

type Props = AudienceFeatureLayoutProps & InjectedIntlProps & ValidatorProps;

class AudienceFeatureLayout extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.getAudienceFeature();
  }
  getAudienceFeature = () => {
    const { parametricPredicateResource, audienceFeatures } = this.props;
    if (audienceFeatures) {
      this.setState({
        audienceFeature: audienceFeatures.find(
          f => f.id === parametricPredicateResource.parametric_predicate_id,
        ),
      });
    }
  };

  render() {
    const { audienceFeature } = this.state;

    const { datamartId, formPath, objectTypes, formChange } = this.props;

    return audienceFeature ? (
      <React.Fragment>
        <div className="mcs-audienceBuilder_audienceFeatureName">{`${audienceFeature.name}`}</div>
        {!!audienceFeature.description && (
          <i className="mcs-audienceBuilder_audienceFeatureDescription">{`${audienceFeature.description} `}</i>
        )}
        {audienceFeature.variables.map((v, index) => {
          return (
            <AudienceFeatureVariable
              newLayout={false}
              key={index}
              datamartId={datamartId}
              variable={v}
              formPath={formPath}
              objectTypes={objectTypes}
              formChange={formChange}
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

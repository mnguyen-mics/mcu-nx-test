import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { AudienceFeatureResource } from '../../../../models/audienceFeature';
import { withValidators } from '../../../../components/Form';
import { ValidatorProps } from '../../../../components/Form/withValidators';
import { AudienceBuilderParametricPredicateNode } from '../../../../models/audienceBuilder/AudienceBuilderResource';
import { Field, GenericField } from 'redux-form';
import { FormRelativeAbsoluteDateProps } from '../../../QueryTool/JSONOTQL/Edit/Sections/Field/Comparison/FormRelativeAbsoluteDate';
import AudienceFeatureVariable from './AudienceFeatureVariable';
import { ObjectLikeTypeInfoResource } from '../../../../models/datamart/graphdb/RuntimeSchema';
import { Spin, Row, Col, Button } from 'antd';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';

export const FormRelativeAbsoluteDateField = Field as new () => GenericField<FormRelativeAbsoluteDateProps>;

interface State {
  audienceFeature?: AudienceFeatureResource;
}

export interface AudienceFeatureLayoutProps {
  onClose?: () => void;
  datamartId: string;
  formPath: string;
  parametricPredicateResource?: AudienceBuilderParametricPredicateNode;
  objectTypes: ObjectLikeTypeInfoResource[];
  audienceFeatures?: AudienceFeatureResource[];
  formChange?(field: string, value: any): void;
  disabled?: boolean;
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

  componentDidUpdate(prevProps: Props) {
    const { audienceFeatures } = this.props;
    if (audienceFeatures && audienceFeatures !== prevProps.audienceFeatures) {
      this.setState({
        audienceFeature: audienceFeatures[0],
      });
    }
  }

  getAudienceFeature = () => {
    const { parametricPredicateResource, audienceFeatures } = this.props;
    if (audienceFeatures) {
      // if parametricPredicateResource is not defined it means we are in edition mode
      // and audienceFeature doesn't exist yet so we take audienceFeatures[0]
      // which is in fact the formData from audienceFeature form

      this.setState({
        audienceFeature: parametricPredicateResource
          ? audienceFeatures.find(f => f.id === parametricPredicateResource.parametric_predicate_id)
          : audienceFeatures[0],
      });
    }
  };

  render() {
    const { audienceFeature } = this.state;

    const { datamartId, formPath, objectTypes, onClose, formChange, disabled } = this.props;

    return audienceFeature ? (
      <React.Fragment>
        {/* Title + Close button */}
        <Row>
          <Col span={23}>
            <div className='mcs-audienceBuilder_audienceFeatureName'>{`${audienceFeature.name}`}</div>
          </Col>
          <Col span={1}>
            {onClose && (
              <Button className='mcs-audienceBuilder_closeButton' onClick={onClose}>
                <McsIcon type='close' />
              </Button>
            )}
          </Col>
        </Row>

        {/* Description */}
        <Row>
          <Col span={24}>
            {!!audienceFeature.description && (
              <i className='mcs-audienceBuilder_audienceFeatureDescription'>{`${audienceFeature.description} `}</i>
            )}
          </Col>
        </Row>

        {/* Inputs */}
        <Row>
          <Col span={24}>
            {audienceFeature.variables &&
              audienceFeature.variables.map((v, index) => {
                return (
                  <AudienceFeatureVariable
                    key={index}
                    datamartId={datamartId}
                    variable={v}
                    formPath={formPath}
                    objectTypes={objectTypes}
                    formChange={formChange}
                    disabled={disabled}
                  />
                );
              })}
          </Col>
        </Row>
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

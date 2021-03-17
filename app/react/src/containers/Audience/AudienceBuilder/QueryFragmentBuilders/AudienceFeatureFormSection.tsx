import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { ReduxFormChangeProps } from '../../../../utils/FormHelper';
import { WrappedFieldArrayProps } from 'redux-form';
import { AudienceBuilderParametricPredicateNode } from '../../../../models/audienceBuilder/AudienceBuilderResource';
import { Row, Col, Button } from 'antd';
import AudienceFeatureLayout from './AudienceFeatureLayout';
import { ObjectLikeTypeInfoResource } from '../../../../models/datamart/graphdb/RuntimeSchema';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import { AudienceFeatureResource } from '../../../../models/audienceFeature';

export interface AudienceFeatureFormSectionProps extends ReduxFormChangeProps {
  isDemographicsSection: boolean;
  datamartId: string;
  objectTypes: ObjectLikeTypeInfoResource[];
  audienceFeatures?: AudienceFeatureResource[]
  formChange(field: string, value: any): void;
}

type Props = WrappedFieldArrayProps<AudienceBuilderParametricPredicateNode> &
  AudienceFeatureFormSectionProps &
  InjectedIntlProps;

class AudienceFeatureFormSection extends React.Component<Props> {


  render() {
    const {
      fields,
      isDemographicsSection,
      datamartId,
      objectTypes,
      audienceFeatures,
      formChange
    } = this.props;

    return fields.map((name, index) => {
      const handleRemove = () => fields.remove(index);
      return (
        <Row
          key={`${index}_${fields.length}`}
          className={
            isDemographicsSection
              ? 'mcs-audienceBuilder_demographicFeature'
              : 'mcs-audienceBuilder_audienceFeature'
          }
        >
          <Col span={isDemographicsSection ? 24 : 22}>
            <AudienceFeatureLayout
              formPath={`${name}`}
              datamartId={datamartId}
              parametricPredicateResource={fields.get(index)}
              objectTypes={objectTypes}
              audienceFeatures={audienceFeatures}
              formChange={formChange}
            />
          </Col>

          {!isDemographicsSection && (
            <React.Fragment>
              <Col span={2}>
                <Button
                  className="mcs-audienceBuilder_closeButton"
                  onClick={handleRemove}
                >
                  <McsIcon type="close" />
                </Button>
              </Col>
            </React.Fragment>
          )}
        </Row>
      );
    });
  }
}

export default compose<Props, AudienceFeatureFormSectionProps>(injectIntl)(
  AudienceFeatureFormSection,
);

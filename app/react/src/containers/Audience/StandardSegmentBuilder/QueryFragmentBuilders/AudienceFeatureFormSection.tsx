import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { ReduxFormChangeProps } from '../../../../utils/FormHelper';
import { WrappedFieldArrayProps } from 'redux-form';
import { StandardSegmentBuilderParametricPredicateNode } from '../../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';
import { Row, Col } from 'antd';
import AudienceFeatureLayout from './AudienceFeatureLayout';
import { ObjectLikeTypeInfoResource } from '../../../../models/datamart/graphdb/RuntimeSchema';
import { Card } from '@mediarithmics-private/mcs-components-library';
import { AudienceFeatureResource } from '../../../../models/audienceFeature';

export interface AudienceFeatureFormSectionProps extends ReduxFormChangeProps {
  isDemographicsSection: boolean;
  datamartId: string;
  removeGroup: () => void;
  objectTypes: ObjectLikeTypeInfoResource[];
  audienceFeatures?: AudienceFeatureResource[];
  formChange(field: string, value: any): void;
}

type Props = WrappedFieldArrayProps<StandardSegmentBuilderParametricPredicateNode> &
  AudienceFeatureFormSectionProps &
  InjectedIntlProps;

class AudienceFeatureFormSection extends React.Component<Props> {
  render() {
    const {
      fields,
      datamartId,
      objectTypes,
      removeGroup,
      audienceFeatures,
      formChange,
    } = this.props;

    const removeFieldOrGroup = (index: number) => () => {
      if (fields.getAll().length === 1) {
        removeGroup();
      } else {
        fields.remove(index);
      }
    };

    return fields.map((name, index) => {
      return (
        <Card
          key={`${index}_${fields.length}`}
          className={'mcs-standardSegmentBuilder_audienceFeature'}
        >
          <Row
            key={`${index}_${fields.length}`}
            className={'mcs-standardSegmentBuilder_audienceFeatureContent'}
          >
            <Col span={24}>
              <AudienceFeatureLayout
                onClose={removeFieldOrGroup(index)}
                formPath={`${name}`}
                datamartId={datamartId}
                parametricPredicateResource={fields.get(index)}
                objectTypes={objectTypes}
                audienceFeatures={audienceFeatures}
                formChange={formChange}
              />
            </Col>
          </Row>
        </Card>
      );
    });
  }
}

export default compose<Props, AudienceFeatureFormSectionProps>(injectIntl)(
  AudienceFeatureFormSection,
);

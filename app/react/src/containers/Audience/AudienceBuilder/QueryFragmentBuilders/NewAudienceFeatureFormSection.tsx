import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { ReduxFormChangeProps } from '../../../../utils/FormHelper';
import { WrappedFieldArrayProps } from 'redux-form';
import { AudienceBuilderParametricPredicateNode } from '../../../../models/audienceBuilder/AudienceBuilderResource';
import { Row, Col } from 'antd';
import NewAudienceFeatureLayout from './NewAudienceFeatureLayout';
import { ObjectLikeTypeInfoResource } from '../../../../models/datamart/graphdb/RuntimeSchema';
import { Card } from '@mediarithmics-private/mcs-components-library';
import { AudienceFeatureResource } from '../../../../models/audienceFeature';

export interface NewAudienceFeatureFormSectionProps
  extends ReduxFormChangeProps {
  isDemographicsSection: boolean;
  datamartId: string;
  removeGroup: () => void;
  objectTypes: ObjectLikeTypeInfoResource[];
  audienceFeatures?: AudienceFeatureResource[];
}

type Props = WrappedFieldArrayProps<AudienceBuilderParametricPredicateNode> &
  NewAudienceFeatureFormSectionProps &
  InjectedIntlProps;

class NewAudienceFeatureFormSection extends React.Component<Props> {
  render() {
    const {
      fields,
      isDemographicsSection,
      datamartId,
      objectTypes,
      removeGroup,
      audienceFeatures,
    } = this.props;

    const removeFieldOrGroup = (index: number) => () => {
      if (fields.getAll().length == 1) {
        removeGroup();
      } else {
        fields.remove(index);
      }
    };

    return fields.map((name, index) => {
      return (
        <Card className={'mcs-audienceBuilder_audienceFeature-2'}>
              {/* // isDemographicsSection
              //   ? 'mcs-audienceBuilder_demographicFeature-2'
              //   : 'mcs-audienceBuilder_audienceFeature-2' */}
          <Row
            key={`${index}_${fields.length}`}
            className={"mcs-audienceBuilder_audienceFeatureContent"}
          >
            <Col span={24}>
              <NewAudienceFeatureLayout
                showCloseButton={!isDemographicsSection}
                onClose={removeFieldOrGroup(index)}
                formPath={`${name}`}
                datamartId={datamartId}
                parametricPredicateResource={fields.get(index)}
                objectTypes={objectTypes}
                audienceFeatures={audienceFeatures}
              />
            </Col>
          </Row>
        </Card>
      );
    });
  }
}

export default compose<Props, NewAudienceFeatureFormSectionProps>(injectIntl)(
  NewAudienceFeatureFormSection,
);

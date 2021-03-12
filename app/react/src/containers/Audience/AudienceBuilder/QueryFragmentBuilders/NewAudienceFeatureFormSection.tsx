import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { ReduxFormChangeProps } from '../../../../utils/FormHelper';
import { WrappedFieldArrayProps } from 'redux-form';
import { AudienceBuilderParametricPredicateNode } from '../../../../models/audienceBuilder/AudienceBuilderResource';
import { Row, Col, Button } from 'antd';
import NewAudienceFeatureLayout from './NewAudienceFeatureLayout';
import { ObjectLikeTypeInfoResource } from '../../../../models/datamart/graphdb/RuntimeSchema';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import { AudienceFeatureResource } from '../../../../models/audienceFeature';

export interface NewAudienceFeatureFormSectionProps extends ReduxFormChangeProps {
  isDemographicsSection: boolean;
  datamartId: string;
  removeGroup: () => void;
  objectTypes: ObjectLikeTypeInfoResource[];
  audienceFeatures?: AudienceFeatureResource[]
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
      audienceFeatures
    } = this.props;

    return fields.map((name, index) => {
      const handleRemove = () => {
        if (fields.getAll().length == 1) {
          removeGroup();
        } else {
          fields.remove(index);
        }
      }

      return (
        <Row
          key={`${index}_${fields.length}`}
          className={
            isDemographicsSection
              ? 'mcs-audienceBuilder_demographicFeature-2'
              : 'mcs-audienceBuilder_audienceFeature-2'
          }
        >
          <Col span={isDemographicsSection ? 24 : 22}>
            <NewAudienceFeatureLayout
              formPath={`${name}`}
              datamartId={datamartId}
              parametricPredicateResource={fields.get(index)}
              objectTypes={objectTypes}
              audienceFeatures={audienceFeatures}
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

export default compose<Props, NewAudienceFeatureFormSectionProps>(injectIntl)(
  NewAudienceFeatureFormSection,
);

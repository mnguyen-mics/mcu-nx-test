import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { ReduxFormChangeProps } from '../../../../utils/FormHelper';
import { WrappedFieldArrayProps } from 'redux-form';
import { AudienceBuilderParametricPredicateNode } from '../../../../models/audienceBuilder/AudienceBuilderResource';
import { Row, Col, Button } from 'antd';
import { McsIcon } from '../../../../components';
import AudienceFeatureLayout from './AudienceFeatureLayout';

export interface AudienceFeatureFormSectionProps extends ReduxFormChangeProps {
  isDemographicsSection: boolean;
  datamartId: string;
}

type Props = WrappedFieldArrayProps<AudienceBuilderParametricPredicateNode> &
  AudienceFeatureFormSectionProps &
  InjectedIntlProps;

class AudienceFeatureFormSection extends React.Component<Props> {
  render() {
    const { fields, isDemographicsSection, datamartId } = this.props;

    return fields.map((name, index) => {
      const handleRemove = () => fields.remove(index);
      return (
        <Row
          key={`${index}_${fields.length}`}
          className={
            isDemographicsSection
              ? 'mcs-segmentBuilder_demographicFeature'
              : 'mcs-segmentBuilder_audienceFeature'
          }
        >
          <Col span={isDemographicsSection ? 24 : 22}>
            <AudienceFeatureLayout
              formPath={`${name}`}
              datamartId={datamartId}
              parametricPredicateResource={fields.get(index)}
            />
          </Col>

          {!isDemographicsSection && (
            <React.Fragment>
              {/* <Col span={2}>
                <Statistic
                  value={3.2}
                  className="mcs-segmentBuilder_audienceFeatureTotal"
                />
              </Col> */}
              <Col span={2}>
                <Button
                  className="mcs-segmentBuilder_closeButton"
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

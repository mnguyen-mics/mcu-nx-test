import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { ReduxFormChangeProps } from '../../../../utils/FormHelper';
import { WrappedFieldArrayProps } from 'redux-form';
import { AudienceBuilderFieldNode } from '../../../../models/audienceBuilder/AudienceBuilderResource';
import { Row, Col, Button, Statistic } from 'antd';
import { McsIcon } from '../../../../components';
import ParametricPredicateLayout from './ParametricPredicateLayout';

export interface AudienceFeatureFormSectionProps extends ReduxFormChangeProps {
  isDemographicsSection: boolean;
}

type Props = WrappedFieldArrayProps<AudienceBuilderFieldNode> &
  AudienceFeatureFormSectionProps &
  InjectedIntlProps;

class AudienceFeatureFormSection extends React.Component<Props> {
  render() {
    const { fields, isDemographicsSection } = this.props;

    return fields && fields.getAll()
      ? fields.getAll().map((f, index) => {
          const handleRemove = () => fields.remove(index);
          return (
            <Row
              key={f.key}
              className={
                isDemographicsSection
                  ? 'mcs-segmentBuilder_demographicFeature'
                  : 'mcs-segmentBuilder_audienceFeature'
              }
            >
              <Col span={isDemographicsSection ? 24 : 20}>
                <div className="mcs-segmentBuilder_audienceFeatureName">{`${f.model.field} `}</div>
                {f.parametricPredicateResource && (
                  <ParametricPredicateLayout
                    parametricPredicateResource={f.parametricPredicateResource}
                  />
                )}
              </Col>

              {!isDemographicsSection && (
                <React.Fragment>
                  <Col span={2}>
                    <Statistic
                      value={3.2}
                      className="mcs-segmentBuilder_audienceFeatureTotal"
                    />
                  </Col>
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
        })
      : 'undefined';
  }
}

export default compose<Props, AudienceFeatureFormSectionProps>(injectIntl)(
  AudienceFeatureFormSection,
);

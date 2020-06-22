import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
// import { FORM_ID } from '../constants';
import { ReduxFormChangeProps } from '../../../../utils/FormHelper';
import { WrappedFieldArrayProps } from 'redux-form';
import {
  // AudienceBuilderFormData,
  AudienceBuilderFieldNode,
} from '../../../../models/audienceBuilder/AudienceBuilderResource';
import { Row, Col, Button } from 'antd';
import { McsIcon } from '../../../../components';

export interface AudienceFeatureFormSectionProps extends ReduxFormChangeProps {}

type Props = WrappedFieldArrayProps<AudienceBuilderFieldNode> &
  AudienceFeatureFormSectionProps &
  InjectedIntlProps;

class AudienceFeatureFormSection extends React.Component<Props> {
  render() {
    const { fields } = this.props;

    return fields && fields.getAll()
      ? fields.getAll().map((f, index) => {
          const handleRemove = () => fields.remove(index);
          return (
            <Row key={f.key}>
              <Col span={20}>
                {`${f.model.field} `}
                {f.model.comparison && f.model.comparison.values[0] !== '' && (
                  <span>
                    {`(values: ${f.model.comparison.values.map(v => {
                      return v;
                    })})`}
                  </span>
                )}
              </Col>
              <Col span={4}>
                <Button
                  className="mcs-segmentBuilder_closeButton"
                  onClick={handleRemove}
                >
                  <McsIcon type="close" />
                </Button>}
              </Col>
            </Row>
          );
        })
      : 'undefined';
  }
}

export default compose<Props, AudienceFeatureFormSectionProps>(
  injectIntl,
  // reduxForm<AudienceBuilderFormData, AudienceFeatureFormSectionProps>({
  //   form: FORM_ID,
  //   enableReinitialize: true,
  // }),
)(AudienceFeatureFormSection);

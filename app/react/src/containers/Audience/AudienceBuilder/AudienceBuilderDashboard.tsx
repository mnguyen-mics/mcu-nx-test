import * as React from 'react';
import { Statistic, Row, Col, Progress } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { messages } from './constants';
import { compose } from 'recompose';

interface AudienceBuilderDashboardProps {
  totalAudience: number;
}

type Props = InjectedIntlProps & AudienceBuilderDashboardProps;

class AudienceBuilderDashboard extends React.Component<Props> {
  render() {
    const { intl, totalAudience } = this.props;
    return (
      <div className="mcs-segmentBuilder_liveDashboard">
        <Statistic
          title={intl.formatMessage(messages.totalAudience)}
          value={totalAudience}
          className="mcs-segmentBuilder_totalAudience"
        />
        <div className="mcs-segmentBuilder_purchaseIntent">
          <div className="title">
            {intl.formatMessage(messages.purchasIntent)}
          </div>
          <div className="mcs-segmentBuilder_progressBars-1">
            <Row className="mcs-segmentBuilder_progressBar">
              <Col span={8}>Food & Drinks </Col>
              <Col span={16}>
                <Progress percent={81.1} />
              </Col>
            </Row>
            <Row className="mcs-segmentBuilder_progressBar">
              <Col span={8}>Household appliances </Col>
              <Col span={16}>
                <Progress percent={62.84} />
              </Col>
            </Row>
          </div>
        </div>
        <div className="mcs-segmentBuilder_geographics">
          <div className="title">
            {intl.formatMessage(messages.geographics)}
          </div>
          <div className="mcs-segmentBuilder_progressBars-2">
            <Row className="mcs-segmentBuilder_progressBar">
              <Col span={8}>USA </Col>
              <Col span={16}>
                <Progress percent={81.1} />
              </Col>
            </Row>
            <Row className="mcs-segmentBuilder_progressBar">
              <Col span={8}>France </Col>
              <Col span={16}>
                <Progress percent={62.84} />
              </Col>
            </Row>
          </div>
        </div>
      </div>
    );
  }
}

export default compose<Props, AudienceBuilderDashboardProps>(injectIntl)(
  AudienceBuilderDashboard,
);

import * as React from 'react';
import { Row, Col } from 'antd';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../../Helpers/injectThemeColors';
import { messages } from '../AudienceSegment';

export interface ABComparisonGaugeProps {
  weight?: number;
}

type Props = ABComparisonGaugeProps &
  InjectedIntlProps &
  InjectedThemeColorsProps;

class ABComparisonGauge extends React.Component<Props> {
  getGaugeRatio = (percent: number) => {
    if (percent === 0) {
      return [0, 24]; // 0%
    } else if (percent >= 0 && percent < 20) {
      return [4, 20]; // 16.66%
    } else if (percent >= 20 && percent < 30) {
      return [6, 18]; // 25%
    } else if (percent >= 30 && percent < 37.5) {
      return [8, 16]; // 33.33 %
    } else if (percent >= 37.5 && percent < 45) {
      return [10, 14]; // 41.66%
    } else if (percent >= 45 && percent < 55) {
      return [12, 12]; // 50 %
    } else if (percent >= 55 && percent < 62.5) {
      return [14, 10]; // 58.33 %
    } else if (percent >= 62.5 && percent < 70) {
      return [16, 8]; // 66.66%
    } else if (percent >= 70 && percent < 80) {
      return [18, 6]; // 75%
    } else if (percent >= 80 && percent < 100) {
      return [20, 4]; // 83.33%
    } else if (percent === 100) {
      return [24, 0]; // 100%
    } else return [50, 50];
  };

  render() {
    const { intl } = this.props;
    // const percent = weight && Math.round(weight * 100) / 100;
    const percent = 60;
    return (
      50 && (
        <div className="mcs-audience-segment-dashboard_ab-gauge">
          <Row>
            <Col
              className={`mcs-audience-segment-dashboard_ab-gauge-left`}
              span={this.getGaugeRatio(percent)[1]}
            >
              {intl.formatMessage(messages.experimentation)} ({100 - percent}%)
            </Col>
            <Col
              className={`mcs-audience-segment-dashboard_ab-gauge-right`}
              span={this.getGaugeRatio(percent)[0]}
            >
              {intl.formatMessage(messages.controlGroup)} ({percent}%)
            </Col>
          </Row>
        </div>
      )
    );
  }
}

export default compose<{}, ABComparisonGaugeProps>(
  injectIntl,
  injectThemeColors,
)(ABComparisonGauge);

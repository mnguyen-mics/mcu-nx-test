import * as React from 'react';
// import { Row, Col } from 'antd';
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
      return [0, 100];
    } else if (percent >= 0 && percent < 15) {
      return [15, 85];
    } else if (percent >= 85 && percent < 100) {
      return [85, 15];
    } else if (percent === 100) {
      return [100, 0];
    } else return [percent, 100 - percent];
  };

  render() {
    const { intl, weight } = this.props;
    const percent = weight && Math.round(weight * 100) / 100;
    return (
      percent && (
        <div className="mcs-audienceSegmentDashboard_abGauge">
          <div
            style={{ width: `${this.getGaugeRatio(percent)[0]}%` }}
            className={`mcs-audienceSegmentDashboard_abGaugeLeft`}
          >
            {intl.formatMessage(messages.experimentation)} ({percent}%)
          </div>
          <div
            style={{ width: `${this.getGaugeRatio(percent)[1]}%` }}
            className={`mcs-audienceSegmentDashboard_abGaugeRight`}
          >
            {intl.formatMessage(messages.controlGroup)} ({100 - percent}%)
          </div>
        </div>
      )
    );
  }
}

export default compose<{}, ABComparisonGaugeProps>(
  injectIntl,
  injectThemeColors,
)(ABComparisonGauge);

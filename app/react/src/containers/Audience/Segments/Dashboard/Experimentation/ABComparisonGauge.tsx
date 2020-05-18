import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../../Helpers/injectThemeColors';
import { messages } from '../AudienceSegment';
import { UserQuerySegment } from '../../../../../models/audiencesegment/AudienceSegmentResource';
import { formatMetric } from '../../../../../utils/MetricHelper';

export interface ABComparisonGaugeProps {
  segment: UserQuerySegment;
  segmentToCompareWith?: UserQuerySegment;
  weight?: number;
}

type Props = ABComparisonGaugeProps &
  InjectedIntlProps &
  InjectedThemeColorsProps;

class ABComparisonGauge extends React.Component<Props> {
  getGaugeRatio = (percent: number) => {
    if (percent === 0) {
      return [0, 100];
    } else if (percent >= 0 && percent < 20) {
      return [20, 80];
    } else if (percent >= 80 && percent < 100) {
      return [80, 20];
    } else if (percent === 100) {
      return [100, 0];
    } else return [percent, 100 - percent];
  };

  render() {
    const { segment, segmentToCompareWith, intl, weight } = this.props;
    const percent = weight && Math.round(weight * 100) / 100;

    return (
      percent && (
        <div className="mcs-audienceSegmentDashboard_abGauge">
          <div
            style={{ width: `${this.getGaugeRatio(percent)[0]}%` }}
            className={`mcs-audienceSegmentDashboard_abGaugeLeft`}
          >
            {intl.formatMessage(messages.experimentation)} ({percent}%)
            <span>{` - ${formatMetric(
              segment.user_points_count,
              '0,0',
            )} User Points`}</span>
          </div>

          <div
            style={{ width: `${this.getGaugeRatio(percent)[1]}%` }}
            className={`mcs-audienceSegmentDashboard_abGaugeRight`}
          >
            {intl.formatMessage(messages.controlGroup)} ({100 - percent}%)
            <span>
              {segmentToCompareWith &&
                ` - ${formatMetric(
                  segmentToCompareWith.user_points_count,
                  '0,0',
                )} User Points`}
            </span>
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

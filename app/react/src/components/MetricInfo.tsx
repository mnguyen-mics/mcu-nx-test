import * as React from 'react';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { Tooltip } from 'antd';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import { McsIconType } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-icon';

export interface MetricInfoProps {
  color: IconColor;
  iconType: McsIconType;
  message: FormattedMessage.MessageDescriptor;
  metricValue: string;
  tooltipMessage: FormattedMessage.MessageDescriptor;
  onClick?: () => void;
}

export type IconColor = 'INITIAL' | 'PAUSED' | 'ACTIVE';

export type Props = MetricInfoProps & InjectedIntlProps;

export interface State {
  isTooltipVisible: boolean;
}

class MetricInfo extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { isTooltipVisible: false };
  }

  generateStatusColor = (color: IconColor) => {
    switch (color) {
      case 'ACTIVE':
        return 'mcs-metrics-status-active';
      case 'INITIAL':
        return 'mcs-metrics-status-pending';
      case 'PAUSED':
        return 'mcs-metrics-status-paused';
      default:
        return 'mcs-metrics-status-pending';
    }
  };

  showTooltip = () => {
    this.setState({ isTooltipVisible: true });
  };

  hideTooltip = () => {
    this.setState({ isTooltipVisible: false });
  };

  render() {
    const {
      intl: { formatMessage },
      color,
      iconType,
      metricValue,
      message,
      tooltipMessage,
      onClick,
    } = this.props;

    const { isTooltipVisible } = this.state;

    return (
      <Tooltip
        placement="top"
        title={formatMessage(tooltipMessage)}
        visible={isTooltipVisible}
      >
        <div
          onClick={onClick}
          className="metric-info"
          onMouseEnter={this.showTooltip}
          onMouseLeave={this.hideTooltip}
        >
          <McsIcon
            style={{ marginRight: 0, flex: 1 }}
            type={iconType}
            className={this.generateStatusColor(color)}
          />
          <div className="metric-label">{formatMessage(message)}</div>
          <div className="metric-value">{metricValue}</div>
        </div>
      </Tooltip>
    );
  }
}

export default compose<Props, MetricInfoProps>(injectIntl)(MetricInfo);

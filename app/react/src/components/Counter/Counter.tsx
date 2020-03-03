import * as React from 'react';
import McsIcon, { McsIconType } from '../McsIcon';
import { Spin, Statistic, Icon } from 'antd';
import { FormattedNumber } from 'react-intl';

export interface LoadingCounterValue {
  value?: number;
  loading?: boolean;
}

export interface Trend {
  value: number;
  type: 'up' | 'down';
}

export interface CounterProps extends LoadingCounterValue {
  iconType: McsIconType;
  iconStyle?: React.CSSProperties;
  unit?: string;
  title: React.ReactNode | string;
  trend?: Trend,
}

export default class Counter extends React.Component<CounterProps> {
  render() {
    const { iconType, iconStyle, unit, title, value, loading, trend } = this.props;

    return (
      <div className="counter" >
        <McsIcon type={iconType} styleIcon={iconStyle ? iconStyle : {}} />
        <div className="counter_title">{title}</div>
        <div className="number">
          {loading ? (
            <Spin />
          ) : (value !== undefined && value !== null) ? (
            <React.Fragment>
              <FormattedNumber value={value} />{unit || ''}
              {trend ? <Statistic
                title=""
                value={trend.value}
                precision={1}
                valueStyle={{ color: trend.type === 'up' ? '#4ea500' : '#ed2333' }}
                prefix={<Icon type={`arrow-${trend.type}`} />}
                suffix="%"
              /> : null}
            </React.Fragment>
          ) : (
                '--'
              )}
        </div>
      </div>
    );
  }
}

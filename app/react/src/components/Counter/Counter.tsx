import * as React from 'react';
import McsIcon, { McsIconType } from '../McsIcon';
import { Spin } from 'antd';
import { FormattedNumber } from 'react-intl';

export interface LoadingCounterValue {
  value?: number;
  loading?: boolean;
}

export interface CounterProps extends LoadingCounterValue {
  iconType: McsIconType;
  iconStyle?: React.CSSProperties;
  unit?: string;
  title: React.ReactNode | string;
}

export default class Counter extends React.Component<CounterProps> {
  render() {
    const { iconType, iconStyle, unit, title, value, loading } = this.props;

    return (
      <div className="counter" >
        <McsIcon type={iconType} style={iconStyle ? iconStyle : {}}/>
        <div className="counter_title">{title}</div>
        <div className="number">
          {loading ? (
            <Spin />
          ) : (value !== undefined && value !== null) ? (
            <span><FormattedNumber value={value} />{unit || ''}</span>
          ) : (
            '--'
          )}
        </div>
      </div>
    );
  }
}

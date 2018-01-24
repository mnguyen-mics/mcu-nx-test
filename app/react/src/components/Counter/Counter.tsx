import * as React from 'react';
import McsIcon, { McsIconType } from '../McsIcon';
import { Spin } from 'antd';
import { FormattedNumber } from 'react-intl';

export interface CounterProps {
  iconType: McsIconType;
  title: React.ReactNode;
  value?: number;
  loading?: boolean;
}

export default class Counter extends React.Component<CounterProps> {
  render() {
    const { iconType, title, value, loading } = this.props;

    return (
      <div className="counter">
        <McsIcon type={iconType} />
        <div className="title">{title}</div>
        <div className="number">
          {loading ? (
            <Spin />
          ) : value !== undefined ? (
            <FormattedNumber value={value} />
          ) : (
            '--'
          )}
        </div>
      </div>
    );
  }
}

import { Progress } from 'antd';
import * as React from 'react';
import numeral from 'numeral';
interface FunnelStepMetricProps {
  value: number;
  pourcentage: number;
  color: string;
  unit?: string;
}

type Props = FunnelStepMetricProps;
class FunnelStepMetric extends React.Component<Props> {
  render() {
    const { value, pourcentage, color, unit } = this.props;
    return (
      <div className={'mcs-funnelQueryBuilder_metric'}>
        <div>
          {numeral(value).format('0,0')}
          {unit}
        </div>
        <Progress showInfo={false} percent={pourcentage} strokeColor={color} />
      </div>
    );
  }
}

export default FunnelStepMetric;

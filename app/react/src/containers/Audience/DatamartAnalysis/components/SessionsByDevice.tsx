import * as React from 'react';
import CardFlex from '../../Dashboard/Components/CardFlex';
import PiePlot, { PiePlotOptionsProps } from '../../../../components/Charts/CategoryBased/PiePlot';
import { CounterDashboard } from '../../../../components/Counter';

const optionsForChart: PiePlotOptionsProps = {
  colors: ['#5c94d1', '#5eabd2', '#95cdcb'],
  showLabels: false,
  showTooltip: true,
  isHalf: false,
  innerRadius: true,
};

class SessionsByDevice extends React.Component {
  render() {
    return (
      <CardFlex title={'Session by Device'}>
        <PiePlot dataset={[{
          key: 'Desktop',
          value: 83.9,
          color: '#5c94d1'
        }, {
          key: 'smartphone',
          value: 15.4,
          color: '#5eabd2'
        }, {
          key: 'tablet',
          value: 0.8,
          color: '#95cdcb'
        }]} options={optionsForChart} />
        <CounterDashboard counters={[
          {
            "iconType": "laptop",
            "iconStyle": {color: '#5c94d1'},
            "unit": "%",
            "title": "Desktop",
            "value": 83.9,
            "loading": false
          },
          {
            "iconType": "smartphone",
            "iconStyle": {color: '#5eabd2'},
            "unit": "%",
            "title": "Mobile",
            "value": 15.4,
            "loading": false
          },
          {
            "iconType": "tablet",
            "iconStyle": {color: '#95cdcb'},
            "unit": "%",
            "title": "Tablet",
            "value": 0.8,
            "loading": false
          }
        ]} />
      </CardFlex>
    );
  }
}

export default SessionsByDevice;
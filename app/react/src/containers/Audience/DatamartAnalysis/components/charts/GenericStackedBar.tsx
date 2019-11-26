import React from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import cuid from 'cuid';

export interface GenericStackedBarProps {
  dataset?: MapData[];
  height: number;
}


const options: Highcharts.Options = {
  title: {
    text: ''
  },
  xAxis: {
    categories: ['03 oct', '04', '05', '06', '07', '08', '09']
  },
  yAxis: {
    min: 0,
    title: {
      text: ''
    }
  },
  legend: {
    reversed: true
  },
  tooltip: {
    enabled: false
  },
  plotOptions: {
    column: {
      stacking: 'normal'
    }
  },
  credits: {
    enabled: false
  },
  series: [
    {
      type: 'column',
      name: 'Other',
      color: '#a6c1f4',
      data: [30, 40, 35, 50, 60, 70]
    },
    {
      type: 'column',
      name: 'Referel',
      color: '#7ca4f1',
      data: [10, 20, 15, 35, 45, 58]
    },
    {
      type: 'column',
      name: 'Organic Search',
      color: '#5186ec',
      data: [20, 35, 45, 24, 18, 32]
    },
    {
      type: 'column',
      name: 'Direct',
      color: '#3e67cf',
      data: [23, 20, 17, 14, 19, 13]
    }
  ]
};

export interface MapData {
  [key: string]: string | number | number[];
}

type Props = GenericStackedBarProps & InjectedIntlProps;

class GenericStackedBar extends React.Component<Props> {
  cuid: string;

  constructor(props: Props) {
    super(props);
    this.cuid = cuid();
  }

  render() {


    return (<div>

      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        style={{ width: '100%' }}
      />
    </div>)
  }
}

export default compose<Props, GenericStackedBarProps>(injectIntl)(GenericStackedBar);

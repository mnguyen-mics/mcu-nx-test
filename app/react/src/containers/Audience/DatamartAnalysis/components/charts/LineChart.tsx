import React from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import cuid from 'cuid';


export interface LineChartProps {
  dataset: MapData[];
  height: number;
}

export interface MapData {
  [key: string]: string | number;
}

type Props = LineChartProps & InjectedIntlProps;

class LineChart extends React.Component<Props> {
  cuid: string;

  constructor(props: Props) {
    super(props);
    this.cuid = cuid();
  }

  render() {
    const options: Highcharts.Options = {
      title: {
        text: undefined,
      },
      credits: {
        enabled: false
      },
      chart: {
        reflow: true
      },
      xAxis: {
        categories: ['15 Sep', '22', '29', '06 Oct'],
        title: undefined
      },
      yAxis: {
        title: undefined
      },
      legend: {
        align: 'right',
        layout: 'vertical',
        verticalAlign: 'middle',
        itemMarginBottom: 25
      },
      series: [
        {
          type: 'line',
          name: '30 days',
          color: '#5c94d1',
          data: [10,12, 11, 13],
        },
        {
          type: 'line',
          name: '7 days',
          color: '#5eabd2',
          data: [6, 7, 4, 8],
        },
        {
          type: 'line',
          name: '1 day',
          color: '#95cdcb',
          data: [2, 4, 3, 5],
        },
      ],
    };

    return (<div>

      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        style={{ width: '100%' }}
      />
    </div>)
  }
}

export default compose<Props, LineChartProps>(injectIntl)(LineChart);

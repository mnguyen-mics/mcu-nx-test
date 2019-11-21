import React from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import cuid from 'cuid';
import HeatmapModule from 'highcharts/modules/heatmap';

HeatmapModule(Highcharts);

export interface HeatMapProps {
  dataset: MapData[];
  height: number;
}

export interface MapData {
  [key: string]: string | number;
}

type Props = HeatMapProps & InjectedIntlProps;

class HeatMap extends React.Component<Props> {
  cuid: string;

  constructor(props: Props) {
    super(props);
    this.cuid = cuid();
  }

  render() {
    const options: Highcharts.Options = {
      chart: {
        type: 'heatmap',
        marginTop: 40,
        marginBottom: 80,
        plotBorderWidth: 1
      },
      credits: {
        enabled: false,
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      },
      yAxis: {
        categories: ['10pm', '8pm', '6pm', '4pm', '2pm', '12pm', '10am', '8am', '6am', '4am', '2am', '12am'],
        title: undefined // null
      },
      colorAxis: {
        min: 0,
        minColor: '#FFFFFF',
        maxColor: '#5186ec'
      },
      legend: {
        align: 'right',
        layout: 'vertical',
        margin: 0,
        verticalAlign: 'top',
        y: 25,
        symbolHeight: 280
      },
      series: [{
        type: 'heatmap',
        name: 'User by time of day',
        borderWidth: 1,
        data: [[0, 3, 3], [1, 11, 1], [2, 8, 8], [3, 6, 5], [4, 7, 6], [5, 4, 10], [6, 5, 9],
        [1, 6, 3], [5, 4, 1], [2, 8, 8], [3, 5, 5], [4, 6, 6], [5, 4, 10], [6, 5, 9],
        [3, 3, 3], [1, 11, 1], [9, 8, 8], [3, 6, 5], [2, 7, 6], [6, 4, 10], [1, 5, 9],
        [1, 3, 3], [1, 11, 1], [2, 8, 8], [4, 6, 5], [4, 2, 6], [5, 4, 10], [5, 5, 9]],
        dataLabels: {
          enabled: true,
          color: '#000'
        }
      }]
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

export default compose<Props, HeatMapProps>(injectIntl)(HeatMap);

import React from 'react';
import Highcharts from 'highcharts/highmaps';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { compose } from 'recompose';
import cuid from 'cuid';
import world from './Charts/world.js';
import log from '../utils/Logger';

export interface WorldMapProps {
  dataset: MapData[];
  height: number;
}

export interface MapData {
  [key: string]: string | number;
}

type Props = WorldMapProps & WrappedComponentProps;

class WorldMap extends React.Component<Props> {
  cuid: string;

  constructor(props: Props) {
    super(props);
    this.cuid = cuid();
  }

  componentDidCatch() {
    log.info(world);
  }

  componentDidMount() {
    const { dataset } = this.props;
    this.generateMap(dataset);
  }

  generateMap = (dataset: MapData[]) => {
    const { height } = this.props;
    // dataset.forEach(data => {
    //   this.value = this.value < 1 ? 1 : this.value;
    // });

    Highcharts.createElement('link', {}, undefined, document.getElementsByTagName('head')[0]);

    (Highcharts as any).theme = {
      colors: ['#003056'],
      chart: {
        backgroundColor: '#ffffff',
        style: {
          fontFamily: 'sans-serif',
          height: height,
        },
        plotBorderColor: '#606063',
      },
      title: {
        style: {
          color: '#E0E0E3',
          textTransform: 'uppercase',
          fontSize: '20px',
        },
      },
      subtitle: {
        style: {
          color: '#E0E0E3',
          textTransform: 'uppercase',
        },
      },
      xAxis: {
        gridLineColor: '#707073',
        labels: {
          style: {
            color: '#E0E0E3',
          },
        },
        lineColor: '#707073',
        minorGridLineColor: '#505053',
        tickColor: '#707073',
        title: {
          style: {
            color: '#A0A0A3',
          },
        },
      },
      yAxis: {
        gridLineColor: '#707073',
        labels: {
          style: {
            color: '#E0E0E3',
          },
        },
        lineColor: '#707073',
        minorGridLineColor: '#505053',
        tickColor: '#707073',
        tickWidth: 1,
        title: {
          style: {
            color: '#A0A0A3',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        style: {
          color: '#F0F0F0',
        },
      },
      legend: {
        itemStyle: {
          color: 'rgba(0, 0, 0, 0.65)',
        },
      },
    };

    // Apply the theme
    Highcharts.setOptions((Highcharts as any).theme);

    Highcharts.mapChart(this.cuid, {
      chart: {
        map: 'custom/world',
      },
      title: {
        text: '',
      },
      colorAxis: {
        dataClasses: [
          {
            color: 'rgba(0,48,86,0.05)',
            to: 1000,
          },
          {
            color: 'rgba(0,48,86,0.2)',
            from: 1000,
            to: 5000,
          },
          {
            color: 'rgba(0,48,86,0.4',
            from: 5000,
            to: 10000,
          },
          {
            color: 'rgba(0,48,86,0.5)',
            from: 10000,
            to: 15000,
          },
          {
            color: 'rgba(0,48,86,0.6)',
            from: 15000,
            to: 20000,
          },
          {
            color: 'rgba(0,48,86,0.8)',
            from: 20000,
            to: 25000,
          },
          {
            color: 'rgba(0,48,86,1)',
            from: 25000,
          },
        ],
      },
      mapNavigation: {
        enabled: true,
        buttonOptions: {
          verticalAlign: 'bottom',
        },
      },
      series: [
        {
          data: dataset,
          mapData: Highcharts.maps['custom/world'],
          joinBy: ['iso-a3', 'code3'] as any,
          name: 'Population density',
          type: 'map',
        },
      ],
    });
  };

  render() {
    return <div id={this.cuid} />;
  }
}

export default compose<Props, WorldMapProps>(injectIntl)(WorldMap);

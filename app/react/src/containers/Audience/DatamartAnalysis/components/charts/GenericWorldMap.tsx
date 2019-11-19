import React from 'react';
import Highcharts from 'highcharts/highmaps';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import cuid from 'cuid';
import world from '../../../../../components/Charts/world';
import log from '../../../../../utils/Logger';
import { isUndefined } from 'lodash';
export interface GenericWorldMapProps {
  dataset: MapData[];
  height: number;
  legend?: Boolean;
}

export interface MapData {
  [key: string]: string | number;
}

type Props = GenericWorldMapProps & InjectedIntlProps;

class GenericWorldMap extends React.Component<Props> {
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
    const { height, legend } = this.props;
    // dataset.forEach(data => {
    //   this.value = this.value < 1 ? 1 : this.value;
    // });


    Highcharts.createElement(
      'link',
      {},
      undefined,
      document.getElementsByTagName('head')[0],
    );

    (Highcharts as any).theme = {
      colors: ['rgba(57,95,189,1)'],
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
        enabled: isUndefined(legend) ? true :legend,
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
            color: 'rgba(161,211,234,1)',
            to: 5,
          },
          {
            color: 'rgba(93,164,239,1)',
            from: 10,
            to: 20,
          },
          {
            color: 'rgba(57,95,189,1)',
            from: 20,
            to: 25,
          }
        ],
      },
      mapNavigation: {
        buttonOptions: {
          verticalAlign: 'bottom',
        },
      },
      credits: {
        enabled: false,
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

export default compose<Props, GenericWorldMapProps>(injectIntl)(GenericWorldMap);
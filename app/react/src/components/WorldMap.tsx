import React from 'react';
import Highcharts from 'highcharts/highmaps';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import cuid from 'cuid';
import world from './Charts/world.js';
import log from '../utils/Logger';

export interface WorldMapProps {
  dataset: Dataset[];
}

interface Dataset {
  [key: string]: string | number;
}

type Props = WorldMapProps & InjectedIntlProps;

Highcharts.createElement(
  'link',
  {
    href: 'https://fonts.googleapis.com/css?family=Unica+One',
    rel: 'stylesheet',
    type: 'text/css',
  },
  undefined,
  document.getElementsByTagName('head')[0],
);

(Highcharts as any).theme = {
  colors: ['#003056'],
  chart: {
    backgroundColor: '#efefef',
    style: {
      fontFamily: "'Unica One', sans-serif",
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
  plotOptions: {
    series: {
      dataLabels: {
        color: '#B0B0B3',
      },
      marker: {
        lineColor: '#333',
      },
    },
    boxplot: {
      fillColor: '#505053',
    },
    candlestick: {
      lineColor: 'white',
    },
    errorbar: {
      color: 'white',
    },
  },
  legend: {
    itemStyle: {
      color: '#E0E0E3',
    },
    itemHoverStyle: {
      color: '#FFF',
    },
    itemHiddenStyle: {
      color: '#606063',
    },
  },
  credits: {
    style: {
      color: '#666',
    },
  },
  labels: {
    style: {
      color: '#707073',
    },
  },

  drilldown: {
    activeAxisLabelStyle: {
      color: '#F0F0F3',
    },
    activeDataLabelStyle: {
      color: '#F0F0F3',
    },
  },

  navigation: {
    buttonOptions: {
      symbolStroke: '#DDDDDD',
      theme: {
        fill: '#505053',
      },
    },
  },

  // scroll charts
  rangeSelector: {
    buttonTheme: {
      fill: '#505053',
      stroke: '#000000',
      style: {
        color: '#CCC',
      },
      states: {
        hover: {
          fill: '#707073',
          stroke: '#000000',
          style: {
            color: 'white',
          },
        },
        select: {
          fill: '#000003',
          stroke: '#000000',
          style: {
            color: 'white',
          },
        },
      },
    },
    inputBoxBorderColor: '#505053',
    inputStyle: {
      backgroundColor: '#333',
      color: 'silver',
    },
    labelStyle: {
      color: 'silver',
    },
  },

  navigator: {
    handles: {
      backgroundColor: '#666',
      borderColor: '#AAA',
    },
    outlineColor: '#CCC',
    maskFill: 'rgba(255,255,255,0.1)',
    series: {
      color: '#7798BF',
      lineColor: '#A6C7ED',
    },
    xAxis: {
      gridLineColor: '#505053',
    },
  },

  scrollbar: {
    barBackgroundColor: '#808083',
    barBorderColor: '#808083',
    buttonArrowColor: '#CCC',
    buttonBackgroundColor: '#606063',
    buttonBorderColor: '#606063',
    rifleColor: '#FFF',
    trackBackgroundColor: '#404043',
    trackBorderColor: '#404043',
  },

  // special colors for some of the
  legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
  background2: '#505053',
  dataLabelsColor: '#B0B0B3',
  textColor: '#C0C0C0',
  contrastTextColor: '#F0F0F3',
  maskColor: 'rgba(255,255,255,0.3)',
};

// Apply the theme
Highcharts.setOptions((Highcharts as any).theme);

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

  generateMap = (dataset: Dataset[]) => {
    // dataset.forEach(data => {
    //   this.value = this.value < 1 ? 1 : this.value;
    // });
    Highcharts.mapChart(this.cuid, {
      chart: {
        map: 'custom/world',
      },
      title: {
        text: 'Fixed tooltip with HTML',
      },
      legend: {
        title: {
          text: 'Population density per km²',
          style: {
            color:
              ((Highcharts as any).theme &&
                (Highcharts as any).theme.textColor) ||
              'black',
          },
        },
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
          states: {
            hover: {
              color: '#00a1df',
            },
          },
        },
      ],
    });
  };

  render() {
    return <div id={this.cuid} style={{ width: '100%' }} />;
  }
}

export default compose<Props, WorldMapProps>(injectIntl)(WorldMap);

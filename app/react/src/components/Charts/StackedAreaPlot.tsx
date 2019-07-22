import * as React from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import moment from 'moment';
import { AREA_OPACITY, generateXAxisGridLine, generateYAxisGridLine, generateTooltip } from './domain';

export interface StackedAreaPlotProps {
  dataset: Dataset;
  options: ChartOptions;
  style?: any;
}

type Dataset = Array<{ [key: string]: string | number | Date | undefined }>;

interface ChartOptions {
  colors: string[];
  yKeys: yKey[];
  xKey: string;
  isDraggable?: boolean;
  onDragEnd?: any;
}

type yKey = { key: string; message: FormattedMessage.MessageDescriptor };

type Props = StackedAreaPlotProps & InjectedIntlProps;

class StackedAreaPlot extends React.Component<Props, {}> {

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  formatSeries = (
    dataset: Dataset,
    xKey: string,
    yKeys: yKey[],
    colors: string[],
  ): Highcharts.SeriesOptionsType[] => {
    const {
      intl: { formatMessage },
    } = this.props;
    return yKeys.map((y, i) => {
      return {
        type: 'area' as any,
        data: dataset.map(data => {
          const yValue = data[y.key];
          return [
            this.formatDateToTs(data[xKey] as string),
            yValue && typeof yValue === 'string' ? parseFloat(yValue) : yValue,
          ];
        }),
        name: formatMessage(y.message),
        color: colors[i],
        fillOpacity: 0.5,
        fillColor: {
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 1,
          },
          stops: [
            [
              0,
              (Highcharts as any)
                .Color(colors[i])
                .setOpacity(AREA_OPACITY)
                .get('rgba'),
            ],
            [
              1,
              (Highcharts as any)
                .Color(colors[i])
                .setOpacity(0)
                .get('rgba'),
            ],
          ],
        },
      };
    });
  };

  formatDateToTs = (date: string) => {
    return moment(date)
      .seconds(0)
      .hours(0)
      .milliseconds(0)
      .minutes(0)
      .valueOf();
  };

  formatXAxis = (dataset: Dataset, xKey: string) => {
    return dataset.map(d => this.formatDateToTs(d[xKey] as string));
  };

  generateMinValue = (dataset: Dataset, yKeys: yKey[],) => {
    const values: number[] = [];
    dataset.forEach(d => {
      yKeys.forEach(y => {
        values.push(d[y.key] as number);
      })
    })
    return Math.min(...values);
  }

  render() {
    const {
      dataset,
      options: { xKey, yKeys, colors },
    } = this.props;

    const options: Highcharts.Options = {
      global: {
        timezoneOffset: new Date().getTimezoneOffset(),
      },
      title: {
        text: '',
      },
      colors: colors,
      plotOptions: {
        area: {
          animation: true,
          marker: {
            radius: 4,
            symbol: 'circle',
          },
          lineWidth: 1,
          states: {
            hover: {
              lineWidth: 1,
            },
          },
          threshold: null,
        } as any,
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
          month: '%e. %b' as any,
          year: '%b' as any,
        },
        ...generateXAxisGridLine()
      },
      time: {
        timezoneOffset: new Date().getTimezoneOffset(),
        useUTC: true,
      },
      yAxis: {
        title: {
          text: null,
        },
        ...generateYAxisGridLine()
      },
      series: this.formatSeries(dataset, xKey, yKeys, colors),
      credits: {
        enabled: false,
      },
      tooltip: {
        shared: true,
        ...generateTooltip()
      },
    };

    return (
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        style={{ width: '100%', height: 400 }}
      />
    );
  }
}

export default compose<Props, StackedAreaPlotProps>(injectIntl)(
  StackedAreaPlot,
);

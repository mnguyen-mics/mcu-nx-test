import * as React from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import moment from 'moment';
import {
  AREA_OPACITY,
  generateXAxisGridLine,
  generateYAxisGridLine,
  generateTooltip,
  BASE_CHART_HEIGHT,
  OnDragEnd,
  generateDraggable,
} from '../domain';

export interface DoubleStackedAreaPlotProps {
  dataset: Dataset;
  options: ChartOptions;
  style?: React.CSSProperties;
}

export type Dataset = Array<{ [key: string]: string | number | Date | undefined }>;

interface ChartOptions {
  colors: string[];
  yKeys: yKey[];
  xKey: string;
  isDraggable?: boolean;
  onDragEnd?: OnDragEnd;
}

type yKey = { key: string; message: FormattedMessage.MessageDescriptor };

type Props = DoubleStackedAreaPlotProps & InjectedIntlProps;

class DoubleStackedAreaPlot extends React.Component<Props, {}> {
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
            this.formatDateToTs(
              data[xKey] as string,
              data.hour_of_day
                ? (data.hour_of_day as number)
                : data.hour
                ? (data.hour as number)
                : undefined,
            ),
            yValue && typeof yValue === 'string' ? parseFloat(yValue) : yValue,
          ];
        }),
        name: formatMessage(y.message),
        color: colors[i],
        fillOpacity: 0.5,
        yAxis: i,
        fillColor: {
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 1,
          },
          stops: [
            [0, (Highcharts as any).Color(colors[i]).setOpacity(AREA_OPACITY).get('rgba')],
            [1, (Highcharts as any).Color(colors[i]).setOpacity(0).get('rgba')],
          ],
        },
      };
    });
  };

  formatDateToTs = (date: string, hour?: number) => {
    return moment(date)
      .utc()
      .seconds(0)
      .hours((hour ? hour : 0) + 24)
      .milliseconds(0)
      .minutes(0)
      .valueOf();
  };

  formatXAxis = (dataset: Dataset, xKey: string) => {
    return dataset.map(d => this.formatDateToTs(d[xKey] as string));
  };

  generateMinValue = (dataset: Dataset, yKeys: yKey[]) => {
    const values: number[] = [];
    dataset.forEach(d => {
      yKeys.forEach(y => {
        values.push(d[y.key] as number);
      });
    });
    return Math.min(...values);
  };

  render() {
    const {
      dataset,
      options: { xKey, yKeys, colors, isDraggable, onDragEnd },
      style,
      intl,
    } = this.props;

    const options: Highcharts.Options = {
      chart: {
        height: BASE_CHART_HEIGHT,
        ...(isDraggable ? generateDraggable(onDragEnd) : {}),
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
          // The Y axis value to serve as the base for the
          // area, for distinguishing between values above and below a threshold.
          // The area between the graph and the threshold is filled.
          threshold: 0,
        },
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
          month: { main: '%e. %b' },
          year: { main: '%b' },
        },
        ...generateXAxisGridLine(),
      },
      time: {
        useUTC: true,
      },
      yAxis: [
        {
          title: {
            text: intl.formatMessage(yKeys[0].message),
          },
          ...generateYAxisGridLine(),
        },
        {
          title: {
            text: intl.formatMessage(yKeys[1].message),
          },
          opposite: true,
        },
      ],
      series: this.formatSeries(dataset, xKey, yKeys, colors),
      credits: {
        enabled: false,
      },
      tooltip: {
        shared: true,
        ...generateTooltip(),
      },
      legend: {
        enabled: false,
      },
    };

    return (
      <div style={style}>
        <HighchartsReact highcharts={Highcharts} options={options} style={{ width: '100%' }} />
      </div>
    );
  }
}

export default compose<Props, DoubleStackedAreaPlotProps>(injectIntl)(DoubleStackedAreaPlot);

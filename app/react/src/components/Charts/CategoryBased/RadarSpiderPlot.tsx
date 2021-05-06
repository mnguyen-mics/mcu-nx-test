import * as React from 'react';
import * as Highcharts from 'highcharts';
require('highcharts/highcharts-more')(Highcharts);
import HighchartsReact from 'highcharts-react-official';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';
import { generateTooltip, BASE_CHART_HEIGHT, SerieSortType } from '../domain';
import { TooltipChart, DataLabel } from '../../../models/dashboards/dashboards';

export interface RadarSpiderPlotProps {
  dataset: Dataset;
  options: RadarSpiderPlotOptions;
  height?: number;
}

type Dataset = Array<{ [key: string]: string | number | Date | undefined }>;

export interface RadarSpiderPlotOptions {
  colors: string[];
  yKeys: yKey[];
  xKey: string;
  showLegend?: boolean;
  type?: string;
  vertical?: boolean;
  tooltip?: TooltipChart;
  labels?: DataLabel;
  sort?: SerieSortType;
}

type yKey = {
  key: string;
  message: FormattedMessage.MessageDescriptor | string;
};

type Props = RadarSpiderPlotProps & InjectedIntlProps;

class RadarSpiderPlot extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  getXAxisValues = (dataset: Dataset, xKey: string, sort?: SerieSortType) => {
    return dataset
      .map(d => {
        return d[xKey] as string;
      })
      .sort((a, b) => {
        if (!sort) {
          return 1;
        }
        return a.localeCompare(b);
      });
  };

  formatSerieData = (dataset: Dataset, y: yKey, xKey: string, sort?: SerieSortType) => {
    return (sort
      ? dataset.sort((a, b) => {
          return (a[xKey] as string).localeCompare(b[xKey] as string);
        })
      : dataset
    ).map(d => {
      return {
        y: d[y.key] ? (d[y.key] as number) : 0,
        count: d[`${y.key}-count`],
      };
    });
  };

  formatSeries = (
    dataset: Dataset,
    yKeys: yKey[],
    xKey: string,
    labels?: DataLabel,
    sort?: SerieSortType,
  ): Highcharts.SeriesOptionsType[] => {
    const {
      intl: { formatMessage },
    } = this.props;
    return yKeys.map(y => {
      return {
        name: typeof y.message === 'string' ? y.message : formatMessage(y.message),
        data: this.formatSerieData(dataset, y, xKey, sort),
        pointPlacement: 'on',
        dataLabels: labels
          ? {
              enabled: labels.enable,
              format: labels.format,
              style: {
                'font-family':
                  'LLCircularWeb-Book, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif',
                color: '#666666',
              },
              filter: labels.filterValue
                ? {
                    property: y,
                    operator: '>',
                    value: labels.filterValue,
                  }
                : undefined,
            }
          : {
              enabled: false,
            },
      } as any;
    });
  };

  render() {
    const {
      dataset,
      options: { colors, xKey, yKeys, showLegend, tooltip, labels, sort },
      height,
    } = this.props;

    const options: Highcharts.Options = {
      chart: {
        polar: true,
        type: 'line',
        height: height ? height : BASE_CHART_HEIGHT,
      },
      title: {
        text: '',
      },
      colors: colors,
      xAxis: {
        categories: this.getXAxisValues(dataset, xKey, sort),
        tickmarkPlacement: 'on',
        lineWidth: 0,
      },
      yAxis: {
        gridLineInterpolation: 'polygon',
        lineWidth: 0,
        min: 0,
      },
      series: this.formatSeries(dataset, yKeys, xKey, labels, sort),
      credits: {
        enabled: false,
      },
      tooltip: {
        shared: true,
        ...generateTooltip(undefined, undefined, tooltip),
      },
      legend: {
        enabled: showLegend === undefined ? false : showLegend,
      },
    };
    return <HighchartsReact highcharts={Highcharts} options={options} style={{ width: '100%' }} />;
  }
}

export default compose<Props, RadarSpiderPlotProps>(injectIntl)(RadarSpiderPlot);

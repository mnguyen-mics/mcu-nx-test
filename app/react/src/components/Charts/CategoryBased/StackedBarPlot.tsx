import * as React from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';
import { generateTooltip, BASE_CHART_HEIGHT } from '../domain';
import { DataLabel, TooltipChart } from '../../../models/dashboards/dashboards';
import injectThemeColors, { InjectedThemeColorsProps } from '../../../containers/Helpers/injectThemeColors';

export interface StackedBarPlotProps {
  dataset: Dataset;
  options: StackedBarPlotOptions;
  height?: number;
}

export type SerieSortType = "A-Z" | "Z-A";

type Dataset = Array<{ [key: string]: string | number | Date | undefined }>;

export interface StackedBarPlotOptions {
  colors: string[];
  yKeys: yKey[];
  xKey: string;
  showLegend?: boolean;
  type?: string;
  vertical?: boolean;
  sort?: SerieSortType;
  labels?: DataLabel;
  tooltip?: TooltipChart;
}

type yKey = { key: string; message: FormattedMessage.MessageDescriptor | string };

type Props = StackedBarPlotProps & InjectedIntlProps & InjectedThemeColorsProps;

class StackedBarPlot extends React.Component<Props, {}> {

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  getXAxisValues = (dataset: Dataset, xKey: string, sort?: SerieSortType) => {
    return dataset.map(d => {
      return d[xKey] as string;
    }).sort((a,b) => {
      if (!sort) {
        return 0;
      }
      return a.localeCompare(b)
    })
  }

  formatSerieData = (dataset: Dataset, y: yKey, xKey: string, sort?: SerieSortType) => {
    return (sort ? dataset.sort((a,b) => {
      return (a[xKey] as string).localeCompare((b[xKey] as string))
    }) : dataset).map(d => {
      return { y: d[y.key] ? d[y.key] as number : 0, count: d[`${y.key}-count`] };
    });
  }

  formatSeries = (dataset: Dataset, yKeys: yKey[], xKey: string, labels?: DataLabel, sort?: SerieSortType): Highcharts.SeriesOptionsType[] => {
    const {intl: {formatMessage}} = this.props;
    return yKeys.map(y => {
      return {
        name: typeof y.message === "string" ? y.message : formatMessage(y.message),
        data: this.formatSerieData(dataset, y, xKey, sort),
        type: "column" as any,
        dataLabels: labels ? {
          enabled: labels.enable,
          format: labels.format,
          style: {
            "font-family": "LLCircularWeb-Book, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", \"Helvetica Neue\", Helvetica, Arial, sans-serif",
            "color": "#666666",
          },
          filter: labels.filterValue ? {
            property: y,
            operator: '>',
            value: labels.filterValue
          } : undefined
        } : {
          enabled: false
        }
      }
    });
  }

  render() {
    const {
      dataset,
      options: { colors, xKey, yKeys, showLegend, type, vertical, sort, labels, tooltip },
      height,
    } = this.props;

    const options: Highcharts.Options = {
      chart: {
        type: type || 'column',
        height: height ? height : BASE_CHART_HEIGHT,
        inverted: vertical,
      },
      title: {
        text: ''
      },
      colors: colors,
      plotOptions: {
        column: {
          
        },
      },
      xAxis: {
        categories: this.getXAxisValues(dataset, xKey, sort)
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

    return (
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
          style={{ width: "100%" }}
        />
    );
  }
}

export default compose<Props, StackedBarPlotProps>(
  injectIntl,
  injectThemeColors
)(StackedBarPlot);
